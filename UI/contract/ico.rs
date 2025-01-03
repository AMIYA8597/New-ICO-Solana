use anchor_lang::prelude::*;
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::{
    associated_token::get_associated_token_address,
    token::{self, Mint, TokenAccount},
};
 
declare_id!("FyCz92Au4vcsanwaJZ8PrykVf6oPgreoYKmCque5Qq45");
 
#[program]
pub mod advanced_ico_program {
    use super::*;
 
    pub fn initialize(
        ctx: Context<Initialize>,
        total_supply: u64,
        token_price: u64,
        start_time: i64,
        duration: i64,
        round_type: RoundType,
    ) -> Result<()> {
        let ico = &mut ctx.accounts.ico_account;
        ico.authority = ctx.accounts.authority.key();
        ico.token_mint = ctx.accounts.token_mint.key();
        ico.total_supply = total_supply;
        ico.token_price = token_price;
        ico.start_time = start_time;
        ico.duration = duration;
        ico.tokens_sold = 0;
        ico.is_active = true;
        ico.round_type = round_type;
        ico.seed_investors = Vec::new();
        ico.total_investors = 0;
        ico.purchase_counter = 0;
 
        Ok(())
    }
 
    pub fn add_seed_investor(ctx: Context<AddSeedInvestor>, investor: Pubkey) -> Result<()> {
        let ico = &mut ctx.accounts.ico_account;
        require!(
            ctx.accounts.authority.key() == ico.authority,
            IcoError::Unauthorized
        );
        require!(
            !ico.seed_investors.contains(&investor),
            IcoError::InvestorAlreadyExists
        );
 
        ico.seed_investors.push(investor);
        Ok(())
    }
 
    pub fn remove_seed_investor(ctx: Context<RemoveSeedInvestor>, investor: Pubkey) -> Result<()> {
        let ico = &mut ctx.accounts.ico_account;
        require!(
            ctx.accounts.authority.key() == ico.authority,
            IcoError::Unauthorized
        );
        if let Some(index) = ico.seed_investors.iter().position(|&x| x == investor) {
            ico.seed_investors.remove(index);
        }
        Ok(())
    }
 
    pub fn update_ico_parameters(
        ctx: Context<UpdateIcoParameters>,
        total_supply: Option<u64>,
        token_price: Option<u64>,
        start_time: Option<i64>,
        duration: Option<i64>,
        round_type: Option<RoundType>,
    ) -> Result<()> {
        let ico = &mut ctx.accounts.ico_account;
        require!(
            ctx.accounts.authority.key() == ico.authority,
            IcoError::Unauthorized
        );
 
        if let Some(supply) = total_supply {
            ico.total_supply = supply;
        }
        if let Some(price) = token_price {
            ico.token_price = price;
        }
        if let Some(start) = start_time {
            ico.start_time = start;
        }
        if let Some(dur) = duration {
            ico.duration = dur;
        }
        if let Some(round) = round_type {
            ico.round_type = round;
        }
        Ok(())
    }
 
    pub fn buy_tokens(ctx: Context<BuyTokens>, amount: u64) -> Result<()> {
        let current_time = Clock::get()?.unix_timestamp;
        let ico = &mut ctx.accounts.ico_account;
 
        require!(
            ico.is_active
                && current_time >= ico.start_time
                && current_time < ico.start_time + ico.duration,
            IcoError::IcoNotActive
        );
 
        if ico.round_type == RoundType::SeedRound {
            require!(
                ico.seed_investors.contains(&ctx.accounts.buyer.key()),
                IcoError::NotWhitelisted
            );
        }
 
        require!(
            ico.tokens_sold + amount <= ico.total_supply,
            IcoError::InsufficientTokens
        );
 
        let total_cost = amount
            .checked_mul(ico.token_price)
            .ok_or(IcoError::MathOverflow)?;
 
        // Transfer payment
        let transfer_context = CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            anchor_lang::system_program::Transfer {
                from: ctx.accounts.buyer.to_account_info(),
                to: ctx.accounts.treasury_wallet.to_account_info(),
            },
        );
        anchor_lang::system_program::transfer(transfer_context, total_cost)?;
 
        // Initialize purchase account
        let purchase = &mut ctx.accounts.purchase_account;
        purchase.buyer = ctx.accounts.buyer.key();
        purchase.amount = amount;
        purchase.is_distributed = false;
        purchase.timestamp = current_time;
        purchase.ico = ico.key();
        ico.purchase_counter = ico
            .purchase_counter
            .checked_add(1)
            .ok_or(IcoError::MathOverflow)?;
 
        // Update ICO stats
        ico.tokens_sold = ico
            .tokens_sold
            .checked_add(amount)
            .ok_or(IcoError::MathOverflow)?;
 
        ico.total_investors = ico
            .total_investors
            .checked_add(1)
            .ok_or(IcoError::MathOverflow)?;
 
        emit!(TokenPurchaseEvent {
            buyer: ctx.accounts.buyer.key(),
            amount,
            price: ico.token_price,
            timestamp: current_time,
        });
 
        Ok(())
    }
 
    pub fn distribute_tokens(ctx: Context<DistributeTokens>) -> Result<()> {
        let ico = &ctx.accounts.ico_account;
        let purchase = &mut ctx.accounts.purchase_account;
 
        require!(!purchase.is_distributed, IcoError::AlreadyDistributed);
        // require!(!ico.is_active, IcoError::IcoStillActive);
 
        // Transfer tokens
        let transfer_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            token::Transfer {
                from: ctx.accounts.treasury_token_account.to_account_info(),
                to: ctx.accounts.buyer_token_account.to_account_info(),
                authority: ctx.accounts.authority.to_account_info(),
            },
        );
 
        token::transfer(transfer_ctx, purchase.amount)?;
 
        // Mark as distributed
        purchase.is_distributed = true;
 
        emit!(PurchaseEvent {
            buyer: purchase.buyer,
            amount: purchase.amount,
            is_distributed: true,
        });/*  */
 
        Ok(())
    }
 
    pub fn end_ico(ctx: Context<EndIco>) -> Result<()> {
        let ico = &mut ctx.accounts.ico_account;
        let current_time = Clock::get()?.unix_timestamp;
        require!(
            current_time >= ico.start_time + ico.duration,
            IcoError::IcoStillActive
        );
        ico.is_active = false;
        Ok(())
    }
 
    pub fn get_seed_investors(ctx: Context<GetSeedInvestors>) -> Result<()> {
        let ico = &ctx.accounts.ico_account;
        msg!("Number of seed investors: {}", ico.seed_investors.len());
        for (index, investor) in ico.seed_investors.iter().enumerate() {
            msg!("Seed Investor {}: {}", index + 1, investor);
        }
        Ok(())
    }
}
 
#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq)]
pub enum RoundType {
    SeedRound,
    PreICO,
    PublicICO,
}
 
impl Default for RoundType {
    fn default() -> Self {
        RoundType::SeedRound
    }
}
 
#[event]
pub struct TokenPurchaseEvent {
    pub buyer: Pubkey,
    pub amount: u64,
    pub price: u64,
    pub timestamp: i64,
}
 
#[event]
pub struct PurchaseEvent {
    pub buyer: Pubkey,
    pub amount: u64,
    pub is_distributed: bool,
}
 
#[account]
#[derive(Default)]
pub struct IcoAccount {
    pub authority: Pubkey,           // 32
    pub token_mint: Pubkey,          // 32
    pub total_supply: u64,           // 8
    pub token_price: u64,            // 8
    pub tokens_sold: u64,            // 8
    pub start_time: i64,             // 8
    pub duration: i64,               // 8
    pub is_active: bool,             // 1
    pub round_type: RoundType,       // 1
    pub seed_investors: Vec<Pubkey>, // 4 + (32 * n)
    pub total_investors: u64,        // 8
    pub purchase_counter: u64,
}
 
#[account]
pub struct PurchaseAccount {
    pub buyer: Pubkey,        // 32
    pub amount: u64,          // 8
    pub is_distributed: bool, // 1
    pub timestamp: i64,       // 8
    pub ico: Pubkey,          // 32 (reference to parent ICO)
}
 
#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
 
    #[account(
        init,
        payer = authority,
        space = 8 +    // discriminator
            32 +       // authority
            32 +       // token_mint
            8 +        // total_supply
            8 +        // token_price
            8 +        // tokens_sold
            8 +        // start_time
            8 +        // duration
            1 +        // is_active
            1 +        // round_type
            4 + (32 * 100) + // seed_investors vector with max 100 investors
            8 +
            8,         // total_investors
        seeds = [b"ico"],
        bump
    )]
    pub ico_account: Account<'info, IcoAccount>,
 
    #[account(mut)]
    pub token_mint: Account<'info, Mint>,
    pub system_program: Program<'info, System>,
}
 
#[derive(Accounts)]
pub struct BuyTokens<'info> {
    #[account(mut)]
    pub buyer: Signer<'info>,
 
    #[account(mut, seeds = [b"ico"], bump)]
    pub ico_account: Account<'info, IcoAccount>,
 
    #[account(
        init,
        payer = buyer,
        space = 8 + 32 + 8 + 1 + 8 + 32, // discriminator + fields
        seeds = [b"purchase",buyer.key().as_ref(),&ico_account.purchase_counter.to_le_bytes()],
        bump
    )]
    pub purchase_account: Account<'info, PurchaseAccount>,
 
    #[account(mut)]
    pub treasury_wallet: SystemAccount<'info>,
 
    pub token_program: Program<'info, token::Token>,
    pub system_program: Program<'info, System>,
}
 
#[derive(Accounts)]
pub struct DistributeTokens<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
 
    #[account(
        mut,
        seeds = [b"ico"],
        bump,
        has_one = authority
    )]
    pub ico_account: Account<'info, IcoAccount>,
 
    #[account(
        mut,
        seeds = [b"purchase",  purchase_account.buyer.as_ref()],
        bump,
        constraint = !purchase_account.is_distributed @ IcoError::AlreadyDistributed,
        constraint = purchase_account.ico == ico_account.key() @ IcoError::InvalidPurchase
    )]
    pub purchase_account: Account<'info, PurchaseAccount>,
 
    #[account(
        mut,
        constraint = treasury_token_account.owner == authority.key() @ IcoError::Unauthorized,
        constraint = treasury_token_account.mint == ico_account.token_mint @ IcoError::InvalidTokenMint
    )]
    pub treasury_token_account: Account<'info, TokenAccount>,
 
    #[account(mut)]
    /// CHECK: Account checked in token transfer
    pub buyer_token_account: UncheckedAccount<'info>,
 
    pub token_program: Program<'info, token::Token>,
    pub system_program: Program<'info, System>,
}
 
#[derive(Accounts)]
pub struct UpdateIcoParameters<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(mut, seeds = [b"ico"], bump)]
    pub ico_account: Account<'info, IcoAccount>,
}
 
#[derive(Accounts)]
pub struct EndIco<'info> {
    #[account(mut, seeds = [b"ico"], bump)]
    pub ico_account: Account<'info, IcoAccount>,
}
 
#[derive(Accounts)]
pub struct AddSeedInvestor<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(mut, seeds = [b"ico"], bump)]
    pub ico_account: Account<'info, IcoAccount>,
}
 
#[derive(Accounts)]
pub struct RemoveSeedInvestor<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(mut, seeds = [b"ico"], bump)]
    pub ico_account: Account<'info, IcoAccount>,
}
 
#[derive(Accounts)]
pub struct GetSeedInvestors<'info> {
    #[account(seeds = [b"ico"], bump)]
    pub ico_account: Account<'info, IcoAccount>,
}
 
#[error_code]
pub enum IcoError {
    #[msg("ICO is not currently active")]
    IcoNotActive,
    #[msg("Insufficient tokens remaining")]
    InsufficientTokens,
    #[msg("ICO is still active")]
    IcoStillActive,
    #[msg("You are not authorized to perform this action")]
    Unauthorized,
    #[msg("Purchase not found")]
    PurchaseNotFound,
    #[msg("Mathematical overflow occurred")]
    MathOverflow,
    #[msg("Investor is not whitelisted for the seed round")]
    NotWhitelisted,
    #[msg("Tokens already distributed for this purchase")]
    AlreadyDistributed,
    #[msg("Invalid purchase account")]
    InvalidPurchase,
    #[msg("Invalid token mint")]
    InvalidTokenMint,
    #[msg("Investor is already in the seed investors list")]
    InvestorAlreadyExists,
}
































































// use anchor_lang::prelude::*;
// use anchor_spl::associated_token::AssociatedToken;
// use anchor_spl::{
//     associated_token::get_associated_token_address,
//     token::{self, Mint, TokenAccount},
// };

// declare_id!("56TcuGYiK1kU1iTr1XLCYV6a4PYT8o4rqzmqvQHdEFNE");

// #[program]
// pub mod advanced_ico_program {
//     use super::*;

//     pub fn initialize(
//         ctx: Context<Initialize>,
//         total_supply: u64,
//         token_price: u64,
//         start_time: i64,
//         duration: i64,
//         round_type: RoundType,
//     ) -> Result<()> {
//         let ico = &mut ctx.accounts.ico_account;
//         ico.authority = ctx.accounts.authority.key();
//         ico.token_mint = ctx.accounts.token_mint.key();
//         ico.total_supply = total_supply;
//         ico.token_price = token_price;
//         ico.start_time = start_time;
//         ico.duration = duration;
//         ico.tokens_sold = 0;
//         ico.is_active = true;
//         ico.round_type = round_type;
//         ico.seed_investors = Vec::new();
//         ico.total_investors = 0;
//         Ok(())
//     }

//     pub fn add_seed_investor(ctx: Context<AddSeedInvestor>, investor: Pubkey) -> Result<()> {
//         let ico = &mut ctx.accounts.ico_account;
//         require!(
//             ctx.accounts.authority.key() == ico.authority,
//             IcoError::Unauthorized
//         );
//         require!(
//             !ico.seed_investors.contains(&investor),
//             IcoError::InvestorAlreadyExists
//         );

//         ico.seed_investors.push(investor);
//         Ok(())
//     }

//     pub fn remove_seed_investor(ctx: Context<RemoveSeedInvestor>, investor: Pubkey) -> Result<()> {
//         let ico = &mut ctx.accounts.ico_account;
//         require!(
//             ctx.accounts.authority.key() == ico.authority,
//             IcoError::Unauthorized
//         );
//         if let Some(index) = ico.seed_investors.iter().position(|&x| x == investor) {
//             ico.seed_investors.remove(index);
//         }
//         Ok(())
//     }

//     pub fn update_ico_parameters(
//         ctx: Context<UpdateIcoParameters>,
//         total_supply: Option<u64>,
//         token_price: Option<u64>,
//         start_time: Option<i64>,
//         duration: Option<i64>,
//         round_type: Option<RoundType>,
//     ) -> Result<()> {
//         let ico = &mut ctx.accounts.ico_account;
//         require!(
//             ctx.accounts.authority.key() == ico.authority,
//             IcoError::Unauthorized
//         );

//         if let Some(supply) = total_supply {
//             ico.total_supply = supply;
//         }
//         if let Some(price) = token_price {
//             ico.token_price = price;
//         }
//         if let Some(start) = start_time {
//             ico.start_time = start;
//         }
//         if let Some(dur) = duration {
//             ico.duration = dur;
//         }
//         if let Some(round) = round_type {
//             ico.round_type = round;
//         }
//         Ok(())
//     }

//     pub fn buy_tokens(ctx: Context<BuyTokens>, amount: u64) -> Result<()> {
//         let current_time = Clock::get()?.unix_timestamp;
//         let ico = &mut ctx.accounts.ico_account;

//         require!(
//             ico.is_active
//                 && current_time >= ico.start_time
//                 && current_time < ico.start_time + ico.duration,
//             IcoError::IcoNotActive
//         );

//         if ico.round_type == RoundType::SeedRound {
//             require!(
//                 ico.seed_investors.contains(&ctx.accounts.buyer.key()),
//                 IcoError::NotWhitelisted
//             );
//         }

//         require!(
//             ico.tokens_sold + amount <= ico.total_supply,
//             IcoError::InsufficientTokens
//         );

//         let total_cost = amount
//             .checked_mul(ico.token_price)
//             .ok_or(IcoError::MathOverflow)?;

//         // Transfer payment
//         let transfer_context = CpiContext::new(
//             ctx.accounts.system_program.to_account_info(),
//             anchor_lang::system_program::Transfer {
//                 from: ctx.accounts.buyer.to_account_info(),
//                 to: ctx.accounts.treasury_wallet.to_account_info(),
//             },
//         );
//         anchor_lang::system_program::transfer(transfer_context, total_cost)?;

//         // Initialize purchase account
//         let purchase = &mut ctx.accounts.purchase_account;
//         purchase.buyer = ctx.accounts.buyer.key();
//         purchase.amount = amount;
//         purchase.is_distributed = false;
//         purchase.timestamp = current_time;
//         purchase.ico = ico.key();

//         // Update ICO stats
//         ico.tokens_sold = ico
//             .tokens_sold
//             .checked_add(amount)
//             .ok_or(IcoError::MathOverflow)?;

//         ico.total_investors = ico
//             .total_investors
//             .checked_add(1)
//             .ok_or(IcoError::MathOverflow)?;

//         emit!(TokenPurchaseEvent {
//             buyer: ctx.accounts.buyer.key(),
//             amount,
//             price: ico.token_price,
//             timestamp: current_time,
//         });

//         Ok(())
//     }

//     pub fn distribute_tokens(ctx: Context<DistributeTokens>) -> Result<()> {
//         let ico = &ctx.accounts.ico_account;
//         let purchase = &mut ctx.accounts.purchase_account;

//         require!(!purchase.is_distributed, IcoError::AlreadyDistributed);
//         // require!(!ico.is_active, IcoError::IcoStillActive);

//         // Transfer tokens
//         let transfer_ctx = CpiContext::new(
//             ctx.accounts.token_program.to_account_info(),
//             token::Transfer {
//                 from: ctx.accounts.treasury_token_account.to_account_info(),
//                 to: ctx.accounts.buyer_token_account.to_account_info(),
//                 authority: ctx.accounts.authority.to_account_info(),
//             },
//         );

//         token::transfer(transfer_ctx, purchase.amount)?;

//         // Mark as distributed
//         purchase.is_distributed = true;

//         emit!(PurchaseEvent {
//             buyer: purchase.buyer,
//             amount: purchase.amount,
//             is_distributed: true,
//         });

//         Ok(())
//     }

//     pub fn end_ico(ctx: Context<EndIco>) -> Result<()> {
//         let ico = &mut ctx.accounts.ico_account;
//         let current_time = Clock::get()?.unix_timestamp;
//         require!(
//             current_time >= ico.start_time + ico.duration,
//             IcoError::IcoStillActive
//         );
//         ico.is_active = false;
//         Ok(())
//     }

//     pub fn get_seed_investors(ctx: Context<GetSeedInvestors>) -> Result<()> {
//         let ico = &ctx.accounts.ico_account;
//         msg!("Number of seed investors: {}", ico.seed_investors.len());
//         for (index, investor) in ico.seed_investors.iter().enumerate() {
//             msg!("Seed Investor {}: {}", index + 1, investor);
//         }
//         Ok(())
//     }
// }

// #[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq)]
// pub enum RoundType {
//     SeedRound,
//     PreICO,
//     PublicICO,
// }

// impl Default for RoundType {
//     fn default() -> Self {
//         RoundType::SeedRound
//     }
// }

// #[event]
// pub struct TokenPurchaseEvent {
//     pub buyer: Pubkey,
//     pub amount: u64,
//     pub price: u64,
//     pub timestamp: i64,
// }

// #[event]
// pub struct PurchaseEvent {
//     pub buyer: Pubkey,
//     pub amount: u64,
//     pub is_distributed: bool,
// }

// #[account]
// #[derive(Default)]
// pub struct IcoAccount {
//     pub authority: Pubkey,           // 32
//     pub token_mint: Pubkey,          // 32
//     pub total_supply: u64,           // 8
//     pub token_price: u64,            // 8
//     pub tokens_sold: u64,            // 8
//     pub start_time: i64,             // 8
//     pub duration: i64,               // 8
//     pub is_active: bool,             // 1
//     pub round_type: RoundType,       // 1
//     pub seed_investors: Vec<Pubkey>, // 4 + (32 * n)
//     pub total_investors: u64,        // 8
// }

// #[account]
// pub struct PurchaseAccount {
//     pub buyer: Pubkey,        // 32
//     pub amount: u64,          // 8
//     pub is_distributed: bool, // 1
//     pub timestamp: i64,       // 8
//     pub ico: Pubkey,          // 32 (reference to parent ICO)
// }

// #[derive(Accounts)]
// pub struct Initialize<'info> {
//     #[account(mut)]
//     pub authority: Signer<'info>,

//     #[account(
//         init,
//         payer = authority,
//         space = 8 +    // discriminator
//             32 +       // authority
//             32 +       // token_mint
//             8 +        // total_supply
//             8 +        // token_price
//             8 +        // tokens_sold
//             8 +        // start_time
//             8 +        // duration
//             1 +        // is_active
//             1 +        // round_type
//             4 + (32 * 100) + // seed_investors vector with max 100 investors
//             8,         // total_investors
//         seeds = [b"ico"],
//         bump
//     )]
//     pub ico_account: Account<'info, IcoAccount>,

//     #[account(mut)]
//     pub token_mint: Account<'info, Mint>,
//     pub system_program: Program<'info, System>,
// }

// #[derive(Accounts)]
// pub struct BuyTokens<'info> {
//     #[account(mut)]
//     pub buyer: Signer<'info>,

//     #[account(mut, seeds = [b"ico"], bump)]
//     pub ico_account: Account<'info, IcoAccount>,

//     #[account(
//         init,
//         payer = buyer,
//         space = 8 + 32 + 8 + 1 + 8 + 32, // discriminator + fields
//         seeds = [b"purchase",buyer.key().as_ref()],
//         bump
//     )]
//     pub purchase_account: Account<'info, PurchaseAccount>,

//     #[account(mut)]
//     pub treasury_wallet: SystemAccount<'info>,

//     pub token_program: Program<'info, token::Token>,
//     pub system_program: Program<'info, System>,
// }

// #[derive(Accounts)]
// pub struct DistributeTokens<'info> {
//     #[account(mut)]
//     pub authority: Signer<'info>,

//     #[account(
//         mut,
//         seeds = [b"ico"],
//         bump,
//         has_one = authority
//     )]
//     pub ico_account: Account<'info, IcoAccount>,

//     #[account(
//         mut,
//         seeds = [b"purchase",  purchase_account.buyer.as_ref()],
//         bump,
//         constraint = !purchase_account.is_distributed @ IcoError::AlreadyDistributed,
//         constraint = purchase_account.ico == ico_account.key() @ IcoError::InvalidPurchase
//     )]
//     pub purchase_account: Account<'info, PurchaseAccount>,

//     #[account(
//         mut,
//         constraint = treasury_token_account.owner == authority.key() @ IcoError::Unauthorized,
//         constraint = treasury_token_account.mint == ico_account.token_mint @ IcoError::InvalidTokenMint
//     )]
//     pub treasury_token_account: Account<'info, TokenAccount>,

//     #[account(mut)]
//     /// CHECK: Account checked in token transfer
//     pub buyer_token_account: UncheckedAccount<'info>,

//     pub token_program: Program<'info, token::Token>,
//     pub system_program: Program<'info, System>,
// }

// #[derive(Accounts)]
// pub struct UpdateIcoParameters<'info> {
//     #[account(mut)]
//     pub authority: Signer<'info>,
//     #[account(mut, seeds = [b"ico"], bump)]
//     pub ico_account: Account<'info, IcoAccount>,
// }

// #[derive(Accounts)]
// pub struct EndIco<'info> {
//     #[account(mut, seeds = [b"ico"], bump)]
//     pub ico_account: Account<'info, IcoAccount>,
// }

// #[derive(Accounts)]
// pub struct AddSeedInvestor<'info> {
//     #[account(mut)]
//     pub authority: Signer<'info>,
//     #[account(mut, seeds = [b"ico"], bump)]
//     pub ico_account: Account<'info, IcoAccount>,
// }

// #[derive(Accounts)]
// pub struct RemoveSeedInvestor<'info> {
//     #[account(mut)]
//     pub authority: Signer<'info>,
//     #[account(mut, seeds = [b"ico"], bump)]
//     pub ico_account: Account<'info, IcoAccount>,
// }

// #[derive(Accounts)]
// pub struct GetSeedInvestors<'info> {
//     #[account(seeds = [b"ico"], bump)]
//     pub ico_account: Account<'info, IcoAccount>,
// }

// #[error_code]
// pub enum IcoError {
//     #[msg("ICO is not currently active")]
//     IcoNotActive,
//     #[msg("Insufficient tokens remaining")]
//     InsufficientTokens,
//     #[msg("ICO is still active")]
//     IcoStillActive,
//     #[msg("You are not authorized to perform this action")]
//     Unauthorized,
//     #[msg("Purchase not found")]
//     PurchaseNotFound,
//     #[msg("Mathematical overflow occurred")]
//     MathOverflow,
//     #[msg("Investor is not whitelisted for the seed round")]
//     NotWhitelisted,
//     #[msg("Tokens already distributed for this purchase")]
//     AlreadyDistributed,
//     #[msg("Invalid purchase account")]
//     InvalidPurchase,
//     #[msg("Invalid token mint")]
//     InvalidTokenMint,
//     #[msg("Investor is already in the seed investors list")]
//     InvestorAlreadyExists,
// }





























































// use anchor_lang::prelude::*;
// use anchor_spl::{
//     associated_token::AssociatedToken,
//     token::{self, Mint, TokenAccount, Transfer},
// };

// declare_id!("56TcuGYiK1kU1iTr1XLCYV6a4PYT8o4rqzmqvQHdEFNE");

// #[program]
// pub mod advanced_ico_program {
//     use super::*;

//     // Initialize the ICO
//     pub fn initialize(
//         ctx: Context<Initialize>,
//         total_supply: u64,
//         token_price: u64,
//         start_time: i64,
//         duration: i64,
//         round_type: RoundType,
//     ) -> Result<()> {
//         let ico = &mut ctx.accounts.ico_account;
//         ico.authority = ctx.accounts.authority.key();
//         ico.token_mint = ctx.accounts.token_mint.key();
//         ico.total_supply = total_supply;
//         ico.token_price = token_price;
//         ico.start_time = start_time;
//         ico.duration = duration;
//         ico.tokens_sold = 0;
//         ico.is_active = true;
//         ico.round_type = round_type;
//         ico.seed_investors = Vec::new();

//         Ok(())
//     }

//     // Update ICO parameters
//     pub fn update_ico_parameters(
//         ctx: Context<UpdateIcoParameters>,
//         total_supply: Option<u64>,
//         token_price: Option<u64>,
//         start_time: Option<i64>,
//         duration: Option<i64>,
//         round_type: Option<RoundType>,
//     ) -> Result<()> {
//         let ico = &mut ctx.accounts.ico_account;

//         require!(
//             ctx.accounts.authority.key() == ico.authority,
//             IcoError::Unauthorized
//         );

//         if let Some(supply) = total_supply {
//             ico.total_supply = supply;
//         }

//         if let Some(price) = token_price {
//             ico.token_price = price;
//         }

//         if let Some(start) = start_time {
//             ico.start_time = start;
//         }

//         if let Some(dur) = duration {
//             ico.duration = dur;
//         }

//         if let Some(round) = round_type {
//             ico.round_type = round;
//         }

//         Ok(())
//     }

//     // Add a seed investor to the whitelist
//     pub fn add_seed_investor(ctx: Context<AddSeedInvestor>, investor: Pubkey) -> Result<()> {
//         let ico = &mut ctx.accounts.ico_account;

//         require!(
//             ctx.accounts.authority.key() == ico.authority,
//             IcoError::Unauthorized
//         );

//         ico.seed_investors.push(investor);

//         Ok(())
//     }

//     // Remove a seed investor from the whitelist
//     pub fn remove_seed_investor(ctx: Context<RemoveSeedInvestor>, investor: Pubkey) -> Result<()> {
//         let ico = &mut ctx.accounts.ico_account;

//         require!(
//             ctx.accounts.authority.key() == ico.authority,
//             IcoError::Unauthorized
//         );

//         if let Some(index) = ico.seed_investors.iter().position(|&x| x == investor) {
//             ico.seed_investors.remove(index);
//         }

//         Ok(())
//     }

//     // Buy tokens during the ICO
//     pub fn buy_tokens(ctx: Context<BuyTokens>, amount: u64) -> Result<()> {
//         let current_time = Clock::get()?.unix_timestamp;
//         let ico = &mut ctx.accounts.ico_account;

//         require!(
//             ico.is_active
//                 && current_time >= ico.start_time
//                 && current_time < ico.start_time + ico.duration,
//             IcoError::IcoNotActive
//         );

//         if ico.round_type == RoundType::SeedRound {
//             require!(
//                 ico.seed_investors.contains(&ctx.accounts.buyer.key()),
//                 IcoError::NotWhitelisted
//             );
//         }

//         require!(
//             ico.tokens_sold + amount <= ico.total_supply,
//             IcoError::InsufficientTokens
//         );

//         let total_cost = amount
//             .checked_mul(ico.token_price)
//             .ok_or(IcoError::MathOverflow)?;

//         let transfer_context = CpiContext::new(
//             ctx.accounts.system_program.to_account_info(),
//             anchor_lang::system_program::Transfer {
//                 from: ctx.accounts.buyer.to_account_info(),
//                 to: ctx.accounts.treasury_wallet.to_account_info(),
//             },
//         );
//         anchor_lang::system_program::transfer(transfer_context, total_cost)?;

//         let purchase = &mut ctx.accounts.purchase_account;
//         purchase.buyer = ctx.accounts.buyer.key();
//         purchase.amount = purchase
//             .amount
//             .checked_add(amount)
//             .ok_or(IcoError::MathOverflow)?;
//         purchase.is_distributed = false;

//         ico.tokens_sold = ico
//             .tokens_sold
//             .checked_add(amount)
//             .ok_or(IcoError::MathOverflow)?;

//         emit!(TokenPurchaseEvent {
//             buyer: ctx.accounts.buyer.key(),
//             amount,
//             price: ico.token_price,
//             round_type: ico.round_type.clone(),
//         });

//         Ok(())
//     }

//     // Distribute tokens to buyers
//     pub fn distribute_tokens(ctx: Context<DistributeTokens>) -> Result<()> {
//         let ico = &mut ctx.accounts.ico_account;

//         require!(!ico.is_active, IcoError::IcoStillActive);
//         require!(ico.tokens_sold > 0, IcoError::InsufficientTokens);

//         require!(
//             ctx.accounts.authority.key() == ico.authority,
//             IcoError::Unauthorized
//         );

//         let transfer_context = CpiContext::new(
//             ctx.accounts.token_program.to_account_info(),
//             Transfer {
//                 from: ctx.accounts.treasury_token_account.to_account_info(),
//                 to: ctx.accounts.buyer_token_account.to_account_info(),
//                 authority: ctx.accounts.authority.to_account_info(),
//             },
//         );

//         token::transfer(transfer_context, ctx.accounts.purchase_account.amount)?;

//         let purchase = &mut ctx.accounts.purchase_account;
//         purchase.is_distributed = true;

//         emit!(PurchaseEvent {
//             buyer: purchase.buyer,
//             amount: purchase.amount,
//             is_distributed: true,
//         });

//         Ok(())
//     }

//     // End the ICO
//     pub fn end_ico(ctx: Context<EndIco>) -> Result<()> {
//         let ico = &mut ctx.accounts.ico_account;
//         let current_time = Clock::get()?.unix_timestamp;

//         require!(
//             current_time >= ico.start_time + ico.duration,
//             IcoError::IcoStillActive
//         );

//         ico.is_active = false;
//         Ok(())
//     }

//     // Get seed investors (utility function)
//     pub fn get_seed_investors(ctx: Context<GetSeedInvestors>) -> Result<()> {
//         let ico = &ctx.accounts.ico_account;
//         msg!("Number of seed investors: {}", ico.seed_investors.len());
//         for (index, investor) in ico.seed_investors.iter().enumerate() {
//             msg!("Seed Investor {}: {}", index + 1, investor);
//         }

//         Ok(())
//     }
// }
// // Fundraising Round Types
// #[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq)]
// pub enum RoundType {
//     SeedRound,
//     PreICO,
//     PublicICO,
// }

// impl Default for RoundType {
//     fn default() -> Self {
//         RoundType::SeedRound
//     }
// }

// // Events
// #[event]
// pub struct TokenPurchaseEvent {
//     pub buyer: Pubkey,
//     pub amount: u64,
//     pub price: u64,
//     pub round_type: RoundType,
// }

// #[event]
// pub struct PurchaseEvent {
//     pub buyer: Pubkey,
//     pub amount: u64,
//     pub is_distributed: bool,
// }

// // Purchase Account
// #[account]
// #[derive(Default)]
// pub struct PurchaseAccount {
//     pub buyer: Pubkey,
//     pub amount: u64,
//     pub is_distributed: bool,
// }

// // ICO Account
// #[account]
// #[derive(Default)]
// pub struct IcoAccount {
//     pub authority: Pubkey,
//     pub token_mint: Pubkey,
//     pub total_supply: u64,
//     pub token_price: u64,
//     pub tokens_sold: u64,
//     pub start_time: i64,
//     pub duration: i64,
//     pub is_active: bool,
//     pub round_type: RoundType,
//     pub seed_investors: Vec<Pubkey>,
// }

// // Account Structs
// #[derive(Accounts)]
// pub struct Initialize<'info> {
//     #[account(mut)]
//     pub authority: Signer<'info>,
//     #[account(
//         init, 
//         payer = authority, 
//         space = 8 + 32 + 2 + 8 + 6 + 1 + 1 + 4 + (32 * 100),
//         seeds = [b"ico"],
//         bump
//     )]
//     pub ico_account: Account<'info, IcoAccount>,
//     #[account(mut)]
//     pub token_mint: Account<'info, Mint>,
//     pub system_program: Program<'info, System>,
// }

// #[derive(Accounts)]
// pub struct UpdateIcoParameters<'info> {
//     #[account(mut)]
//     pub authority: Signer<'info>,
//     #[account(
//         mut,
//         seeds = [b"ico"],
//         bump
//     )]
//     pub ico_account: Account<'info, IcoAccount>,
// }

// #[derive(Accounts)]
// pub struct BuyTokens<'info> {
//     #[account(mut)]
//     pub buyer: Signer<'info>,
//     #[account(
//         mut,
//         seeds = [b"ico"],
//         bump
//     )]
//     pub ico_account: Account<'info, IcoAccount>,
//     #[account(
//         init_if_needed,
//         payer = buyer, 
//         space = 8 + 32 + 8 + 1,
//         seeds = [b"purchase", buyer.key().as_ref()],
//         bump
//     )]
//     pub purchase_account: Account<'info, PurchaseAccount>,
//     #[account(mut)]
//     pub treasury_wallet: SystemAccount<'info>,
//     pub token_program: Program<'info, token::Token>,
//     pub system_program: Program<'info, System>,
// }

// #[derive(Accounts)]
// pub struct DistributeTokens<'info> {
//     #[account(mut)]
//     pub authority: Signer<'info>,
//     #[account(
//         mut,
//         seeds = [b"ico"],
//         bump
//     )]
//     pub ico_account: Account<'info, IcoAccount>,
//     #[account(mut)]
//     pub treasury_token_account: Account<'info, TokenAccount>,
//     #[account(mut)]
//     pub buyer_token_account: Account<'info, TokenAccount>,
//     #[account(
//         mut,
//         seeds = [b"purchase", purchase_account.buyer.as_ref()],
//         bump
//     )]
//     pub purchase_account: Account<'info, PurchaseAccount>,
//     pub token_program: Program<'info, token::Token>,
// }

// #[derive(Accounts)]
// pub struct EndIco<'info> {
//     #[account(
//         mut,
//         seeds = [b"ico"],
//         bump
//     )]
//     pub ico_account: Account<'info, IcoAccount>,
// }

// #[derive(Accounts)]
// pub struct AddSeedInvestor<'info> {
//     #[account(mut)]
//     pub authority: Signer<'info>,
//     #[account(
//         mut,
//         seeds = [b"ico"],
//         bump
//     )]
//     pub ico_account: Account<'info, IcoAccount>,
// }

// #[derive(Accounts)]
// pub struct RemoveSeedInvestor<'info> {
//     #[account(mut)]
//     pub authority: Signer<'info>,
//     #[account(
//         mut,
//         seeds = [b"ico"],
//         bump
//     )]
//     pub ico_account: Account<'info, IcoAccount>,
// }

// #[derive(Accounts)]
// pub struct GetSeedInvestors<'info> {
//     #[account(
//         seeds = [b"ico"],
//         bump
//     )]
//     pub ico_account: Account<'info, IcoAccount>,
// }
// // Error Handling
// #[error_code]
// pub enum IcoError {
//     #[msg("ICO is not currently active")]
//     IcoNotActive,
//     #[msg("Insufficient tokens remaining")]
//     InsufficientTokens,
//     #[msg("ICO is still active")]
//     IcoStillActive,
//     #[msg("You are not authorized to perform this action")]
//     Unauthorized,
//     #[msg("Purchase account not found")]
//     PurchaseAccountNotFound,
//     #[msg("Buyer token account not found")]
//     BuyerTokenAccountNotFound,
//     #[msg("Mathematical overflow occurred")]
//     MathOverflow,
//     #[msg("Investor is not whitelisted for the seed round")]
//     NotWhitelisted,
// }











































// use anchor_lang::prelude::*;
// use anchor_spl::{
//     associated_token::AssociatedToken,
//     token::{self, Mint, TokenAccount, Transfer},
// };

// declare_id!("G2abrCjb3pZDdwUWEN1vsAr3mPBFWrMAgA26LfvNWk8D");

// #[program]
// pub mod advanced_ico_program {
//     use super::*;

//     // Initialize the ICO
//     pub fn initialize(
//         ctx: Context<Initialize>,
//         total_supply: u64,
//         token_price: u64,
//         start_time: i64,
//         duration: i64,
//         round_type: RoundType,
//     ) -> Result<()> {
//         let ico = &mut ctx.accounts.ico_account;
//         ico.authority = ctx.accounts.authority.key();
//         ico.token_mint = ctx.accounts.token_mint.key();
//         ico.total_supply = total_supply;
//         ico.token_price = token_price;
//         ico.start_time = start_time;
//         ico.duration = duration;
//         ico.tokens_sold = 0;
//         ico.is_active = true;
//         ico.round_type = round_type;
//         ico.seed_investors = Vec::new(); // Initialize empty seed investors list

//         Ok(())
//     }

//     // Update ICO parameters
//     pub fn update_ico_parameters(
//         ctx: Context<UpdateIcoParameters>,
//         total_supply: Option<u64>,
//         token_price: Option<u64>,
//         start_time: Option<i64>,
//         duration: Option<i64>,
//         round_type: Option<RoundType>,
//     ) -> Result<()> {
//         let ico = &mut ctx.accounts.ico_account;

//         // Ensure only the ICO authority can update parameters
//         require!(
//             ctx.accounts.authority.key() == ico.authority,
//             IcoError::Unauthorized
//         );

//         // Update parameters if provided
//         if let Some(supply) = total_supply {
//             ico.total_supply = supply;
//         }

//         if let Some(price) = token_price {
//             ico.token_price = price;
//         }

//         if let Some(start) = start_time {
//             ico.start_time = start;
//         }

//         if let Some(dur) = duration {
//             ico.duration = dur;
//         }

//         if let Some(round) = round_type {
//             ico.round_type = round;
//         }

//         Ok(())
//     }

//     // Add a seed investor to the whitelist
//     pub fn add_seed_investor(ctx: Context<AddSeedInvestor>, investor: Pubkey) -> Result<()> {
//         let ico = &mut ctx.accounts.ico_account;

//         // Ensure only the ICO authority can add seed investors
//         require!(
//             ctx.accounts.authority.key() == ico.authority,
//             IcoError::Unauthorized
//         );

//         // Add the investor to the whitelist
//         ico.seed_investors.push(investor);

//         Ok(())
//     }

//     // Remove a seed investor from the whitelist
//     pub fn remove_seed_investor(ctx: Context<RemoveSeedInvestor>, investor: Pubkey) -> Result<()> {
//         let ico = &mut ctx.accounts.ico_account;

//         // Ensure only the ICO authority can remove seed investors
//         require!(
//             ctx.accounts.authority.key() == ico.authority,
//             IcoError::Unauthorized
//         );

//         // Find and remove the investor from the whitelist
//         if let Some(index) = ico.seed_investors.iter().position(|&x| x == investor) {
//             ico.seed_investors.remove(index);
//         }

//         Ok(())
//     }

//     // Buy tokens during the ICO
//     pub fn buy_tokens(ctx: Context<BuyTokens>, amount: u64) -> Result<()> {
//         let current_time = Clock::get()?.unix_timestamp;
//         let ico = &mut ctx.accounts.ico_account;

//         // Validate ICO status and token availability
//         require!(
//             ico.is_active
//                 && current_time >= ico.start_time
//                 && current_time < ico.start_time + ico.duration,
//             IcoError::IcoNotActive
//         );

//         // Special whitelist check for Seed Round
//         if ico.round_type == RoundType::SeedRound {
//             require!(
//                 ico.seed_investors.contains(&ctx.accounts.buyer.key()),
//                 IcoError::NotWhitelisted
//             );
//         }

//         require!(
//             ico.tokens_sold + amount <= ico.total_supply,
//             IcoError::InsufficientTokens
//         );

//         // Calculate total cost
//         let total_cost = amount
//             .checked_mul(ico.token_price)
//             .ok_or(IcoError::MathOverflow)?;

//         // Transfer SOL to treasury
//         let transfer_context = CpiContext::new(
//             ctx.accounts.system_program.to_account_info(),
//             anchor_lang::system_program::Transfer {
//                 from: ctx.accounts.buyer.to_account_info(),
//                 to: ctx.accounts.treasury_wallet.to_account_info(),
//             },
//         );
//         anchor_lang::system_program::transfer(transfer_context, total_cost)?;

//         // Update purchase tracking
//         let purchase = &mut ctx.accounts.purchase_account;
//         purchase.buyer = ctx.accounts.buyer.key();
//         purchase.amount = purchase
//             .amount
//             .checked_add(amount)
//             .ok_or(IcoError::MathOverflow)?;
//         purchase.is_distributed = false;

//         // Update ICO tracking
//         ico.tokens_sold = ico
//             .tokens_sold
//             .checked_add(amount)
//             .ok_or(IcoError::MathOverflow)?;

//         // Emit purchase event
//         emit!(TokenPurchaseEvent {
//             buyer: ctx.accounts.buyer.key(),
//             amount,
//             price: ico.token_price,
//             round_type: ico.round_type.clone(),
//         });

//         Ok(())
//     }

//     // Distribute tokens to buyers
//     pub fn distribute_tokens(ctx: Context<DistributeTokens>) -> Result<()> {
//         let ico = &mut ctx.accounts.ico_account;

//         // Ensure ICO is not active and tokens have been sold
//         require!(!ico.is_active, IcoError::IcoStillActive);
//         require!(ico.tokens_sold > 0, IcoError::InsufficientTokens);

//         // Validate caller is ICO authority
//         require!(
//             ctx.accounts.authority.key() == ico.authority,
//             IcoError::Unauthorized
//         );

//         // Perform token transfer from treasury to buyer's token account
//         let transfer_context = CpiContext::new(
//             ctx.accounts.token_program.to_account_info(),
//             Transfer {
//                 from: ctx.accounts.treasury_token_account.to_account_info(),
//                 to: ctx.accounts.buyer_token_account.to_account_info(),
//                 authority: ctx.accounts.authority.to_account_info(),
//             },
//         );

//         // Transfer tokens equal to purchase amount
//         token::transfer(transfer_context, ctx.accounts.purchase_account.amount)?;

//         // Mark purchase as distributed
//         let purchase = &mut ctx.accounts.purchase_account;
//         purchase.is_distributed = true;

//         // Emit distribution event
//         emit!(PurchaseEvent {
//             buyer: purchase.buyer,
//             amount: purchase.amount,
//             is_distributed: true,
//         });

//         Ok(())
//     }

//     // End the ICO
//     pub fn end_ico(ctx: Context<EndIco>) -> Result<()> {
//         let ico = &mut ctx.accounts.ico_account;
//         let current_time = Clock::get()?.unix_timestamp;

//         require!(
//             current_time >= ico.start_time + ico.duration,
//             IcoError::IcoStillActive
//         );

//         ico.is_active = false;
//         Ok(())
//     }

//     // Get seed investors (utility function)
//     pub fn get_seed_investors(ctx: Context<GetSeedInvestors>) -> Result<()> {
//         let ico = &ctx.accounts.ico_account;
//         msg!("Number of seed investors: {}", ico.seed_investors.len());
//         for (index, investor) in ico.seed_investors.iter().enumerate() {
//             msg!("Seed Investor {}: {}", index + 1, investor);
//         }

//         Ok(())
//     }
// }

// // Fundraising Round Types
// #[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq)]
// pub enum RoundType {
//     SeedRound,
//     PreICO,
//     PublicICO,
// }

// impl Default for RoundType {
//     fn default() -> Self {
//         RoundType::SeedRound
//     }
// }

// // Events
// #[event]
// pub struct TokenPurchaseEvent {
//     pub buyer: Pubkey,
//     pub amount: u64,
//     pub price: u64,
//     pub round_type: RoundType,
// }

// #[event]
// pub struct PurchaseEvent {
//     pub buyer: Pubkey,
//     pub amount: u64,
//     pub is_distributed: bool,
// }

// // Purchase Account
// #[account]
// #[derive(Default)]
// pub struct PurchaseAccount {
//     pub buyer: Pubkey,
//     pub amount: u64,
//     pub is_distributed: bool,
// }

// // ICO Account
// #[account]
// #[derive(Default)]
// pub struct IcoAccount {
//     pub authority: Pubkey,
//     pub token_mint: Pubkey,
//     pub total_supply: u64,
//     pub token_price: u64,
//     pub tokens_sold: u64,
//     pub start_time: i64,
//     pub duration: i64,
//     pub is_active: bool,
//     pub round_type: RoundType,
//     pub seed_investors: Vec<Pubkey>,
// }

// #[derive(Accounts)]
// pub struct Initialize<'info> {
//     #[account(mut)]
//     pub authority: Signer<'info>,
//     #[account(
//         init, 
//         payer = authority, 
//         space = 8 + 32 + 2 + 8 + 6 + 1 + 1 + 4 + (32 * 100),
//         seeds = [b"ico"],
//         bump
//     )]
//     pub ico_account: Account<'info, IcoAccount>,
//     #[account(mut)]
//     pub token_mint: Account<'info, Mint>,
//     pub system_program: Program<'info, System>,
// }

// #[derive(Accounts)]
// pub struct UpdateIcoParameters<'info> {
//     #[account(mut)]
//     pub authority: Signer<'info>,
//     #[account(
//         mut,
//         seeds = [b"ico"],
//         bump
//     )]
//     pub ico_account: Account<'info, IcoAccount>,
// }

// #[derive(Accounts)]
// pub struct BuyTokens<'info> {
//     #[account(mut)]
//     pub buyer: Signer<'info>,
//     #[account(
//         mut,
//         seeds = [b"ico"],
//         bump
//     )]
//     pub ico_account: Account<'info, IcoAccount>,
//     #[account(
//         init_if_needed,
//         payer = buyer, 
//         space = 8 + 32 + 8 + 1,
//         seeds = [b"purchase", buyer.key().as_ref()],
//         bump
//     )]
//     pub purchase_account: Account<'info, PurchaseAccount>,
//     #[account(mut)]
//     pub treasury_wallet: SystemAccount<'info>,
//     pub token_program: Program<'info, token::Token>,
//     pub system_program: Program<'info, System>,
// }

// #[derive(Accounts)]
// pub struct DistributeTokens<'info> {
//     #[account(mut)]
//     pub authority: Signer<'info>,
//     #[account(
//         mut,
//         seeds = [b"ico"],
//         bump
//     )]
//     pub ico_account: Account<'info, IcoAccount>,
//     #[account(mut)]
//     pub treasury_token_account: Account<'info, TokenAccount>,
//     #[account(mut)]
//     pub buyer_token_account: Account<'info, TokenAccount>,
//     #[account(
//         mut,
//         seeds = [b"purchase", purchase_account.buyer.as_ref()],
//         bump
//     )]
//     pub purchase_account: Account<'info, PurchaseAccount>,
//     pub token_program: Program<'info, token::Token>,
// }

// #[derive(Accounts)]
// pub struct EndIco<'info> {
//     #[account(
//         mut,
//         seeds = [b"ico"],
//         bump
//     )]
//     pub ico_account: Account<'info, IcoAccount>,
// }

// #[derive(Accounts)]
// pub struct AddSeedInvestor<'info> {
//     #[account(mut)]
//     pub authority: Signer<'info>,
//     #[account(
//         mut,
//         seeds = [b"ico"],
//         bump
//     )]
//     pub ico_account: Account<'info, IcoAccount>,
// }

// #[derive(Accounts)]
// pub struct RemoveSeedInvestor<'info> {
//     #[account(mut)]
//     pub authority: Signer<'info>,
//     #[account(
//         mut,
//         seeds = [b"ico"],
//         bump
//     )]
//     pub ico_account: Account<'info, IcoAccount>,
// }

// #[derive(Accounts)]
// pub struct GetSeedInvestors<'info> {
//     #[account(
//         seeds = [b"ico"],
//         bump
//     )]
//     pub ico_account: Account<'info, IcoAccount>,
// }

// #[error_code]
// pub enum IcoError {
//     #[msg("ICO is not currently active")]
//     IcoNotActive,
//     #[msg("Insufficient tokens remaining")]
//     InsufficientTokens,
//     #[msg("ICO is still active")]
//     IcoStillActive,
//     #[msg("You are not authorized to perform this action")]
//     Unauthorized,
//     #[msg("Purchase account not found")]
//     PurchaseAccountNotFound,
//     #[msg("Buyer token account not found")]
//     BuyerTokenAccountNotFound,
//     #[msg("Mathematical overflow occurred")]
//     MathOverflow,
//     #[msg("Investor is not whitelisted for the seed round")]
//     NotWhitelisted,
// }






























































































// use anchor_lang::prelude::*;
// use anchor_spl::associated_token::{get_associated_token_address, AssociatedToken};
// use anchor_spl::token::{self, Mint, TokenAccount, Transfer};

// declare_id!("Ed7oyNWphFwoZW6K4S5uczdJ8cc4c2xjoarv4YsLmWtA");

// #[program]
// pub mod advanced_ico_program {
//     use super::*;

//     // Initialize the ICO
//     pub fn initialize(
//         ctx: Context<Initialize>,
//         total_supply: u64,
//         token_price: u64,
//         start_time: i64,
//         duration: i64,
//         round_type: RoundType,
//     ) -> Result<()> {
//         let ico = &mut ctx.accounts.ico_account;
//         ico.authority = ctx.accounts.authority.key();
//         ico.total_supply = total_supply;
//         ico.token_price = token_price;
//         ico.start_time = start_time;
//         ico.duration = duration;
//         ico.tokens_sold = 0;
//         ico.is_active = true;
//         ico.round_type = round_type;

//         Ok(())
//     }

//     // Buy tokens during the ICO
//     pub fn buy_tokens(ctx: Context<BuyTokens>, amount: u64) -> Result<()> {
//         let current_time = Clock::get()?.unix_timestamp;
//         let ico = &mut ctx.accounts.ico_account;

//         // Validate ICO status and token availability
//         require!(
//             ico.is_active
//                 && current_time >= ico.start_time
//                 && current_time < ico.start_time + ico.duration,
//             IcoError::IcoNotActive
//         );

//         require!(
//             ico.tokens_sold + amount <= ico.total_supply,
//             IcoError::InsufficientTokens
//         );

//         // Calculate total cost
//         let total_cost = amount
//             .checked_mul(ico.token_price)
//             .ok_or(IcoError::MathOverflow)?;

//         // Transfer SOL to treasury
//         let transfer_context = CpiContext::new(
//             ctx.accounts.system_program.to_account_info(),
//             anchor_lang::system_program::Transfer {
//                 from: ctx.accounts.buyer.to_account_info(),
//                 to: ctx.accounts.treasury_wallet.to_account_info(),
//             },
//         );
//         anchor_lang::system_program::transfer(transfer_context, total_cost)?;

//         // Update purchase tracking
//         let purchase = &mut ctx.accounts.purchase_account;
//         purchase.buyer = ctx.accounts.buyer.key();
//         purchase.amount = purchase
//             .amount
//             .checked_add(amount)
//             .ok_or(IcoError::MathOverflow)?;
//         purchase.is_distributed = false;

//         // Update ICO tracking
//         ico.tokens_sold = ico
//             .tokens_sold
//             .checked_add(amount)
//             .ok_or(IcoError::MathOverflow)?;

//         // Emit purchase event
//         emit!(TokenPurchaseEvent {
//             buyer: ctx.accounts.buyer.key(),
//             amount,
//             price: ico.token_price,
//             round_type: ico.round_type.clone(),
//         });

//         Ok(())
//     }

//     pub fn batch_distribute_tokens(ctx: Context<BatchDistributeTokens>) -> Result<()> {
//         let ico = &ctx.accounts.ico_account;
//         let current_time = Clock::get()?.unix_timestamp;

//         // Validate ICO status and authority
//         require!(
//             !ico.is_active && current_time >= ico.start_time + ico.duration,
//             IcoError::IcoStillActive
//         );

//         require!(
//             ctx.accounts.authority.key() == ico.authority,
//             IcoError::Unauthorized
//         );

//         // // Prepare signer seeds
//         // let signer_seeds: &[&[u8]] = &[b"ico", &[ctx.bumps.ico_account]];

//         // // Batch token distribution based on purchase accounts
//         // for purchase_account in ctx.remaining_accounts.iter() {
//         // Deserialize the purchase account
//         // let purchase =
//         //     PurchaseAccount::try_deserialize(&mut **purchase_account.data.borrow_mut())?;

//         // Skip already distributed purchases
//         // if purchase.is_distributed {
//         //     continue;
//         // }

//         // // Get associated token account address for the buyer
//         // let recipient_ata =
//         //     get_associated_token_address(&purchase.buyer, &ctx.accounts.token_mint.key());

//         // Fetch the associated token account from remaining accounts
//         // let recipient_ata_info = ctx
//         //     .remaining_accounts
//         //     .iter()
//         //     .find(|account| *account.key == recipient_ata)
//         //     .ok_or(IcoError::BuyerTokenAccountNotFound)?;

//         // // Transfer tokens to the buyer
//         // let transfer_context = CpiContext::new_with_signer(
//         //     ctx.accounts.token_program.to_account_info(),
//         //     Transfer {
//         //         from: ctx.accounts.token_account.to_account_info(),
//         //         to: recipient_ata_info.to_account_info(),
//         //         authority: ctx.accounts.ico_account.to_account_info(),
//         //     },
//         //     &[signer_seeds], // Directly use the slice here
//         // );

//         // token::transfer(transfer_context, purchase.amount)?;

//         // Mark the purchase as distributed
//         // let mut purchase_data = purchase_account.data.borrow_mut();
//         // purchase.is_distributed = true; // Update the purchase directly
//         // purchase.serialize(&mut *purchase_data)?;
//         // }

//         Ok(())
//     }

//     // End the ICO
//     pub fn end_ico(ctx: Context<EndIco>) -> Result<()> {
//         let ico = &mut ctx.accounts.ico_account;
//         let current_time = Clock::get()?.unix_timestamp;

//         require!(
//             current_time >= ico.start_time + ico.duration,
//             IcoError::IcoStillActive
//         );

//         ico.is_active = false;
//         Ok(())
//     }

// }

// // Fundraising Round Types
// #[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq)]
// pub enum RoundType {
//     SeedRound,
//     PreICO,
//     PublicICO,
// }

// impl Default for RoundType {
//     fn default() -> Self {
//         RoundType::SeedRound
//     }
// }

// // Token Purchase Event
// #[event]
// pub struct TokenPurchaseEvent {
//     pub buyer: Pubkey,
//     pub amount: u64,
//     pub price: u64,
//     pub round_type: RoundType,
// }

// // Purchase Account to track individual purchases
// #[account]
// #[derive(Default)]
// pub struct PurchaseAccount {
//     pub buyer: Pubkey,
//     pub amount: u64,
//     pub is_distributed: bool,
// }

// // Account Structs for different instructions
// #[derive(Accounts)]
// pub struct Initialize<'info> {
//     #[account(mut)]
//     pub authority: Signer<'info>,
//     #[account(
//         init, 
//         payer = authority, 
//         space = 8 + 32 + 8 * 6 + 1 + 1,
//         seeds = [b"ico"],
//         bump
//     )]
//     pub ico_account: Account<'info, IcoAccount>,
//     pub system_program: Program<'info, System>,
// }

// #[derive(Accounts)]
// pub struct BuyTokens<'info> {
//     #[account(mut)]
//     pub buyer: Signer<'info>,
//     #[account(
//         mut,
//         seeds = [b"ico"],
//         bump
//     )]
//     pub ico_account: Account<'info, IcoAccount>,
//     #[account(
//         init_if_needed,
//         payer = buyer,
//         space = 8 + 32 + 8 + 1,
//         seeds = [b"purchase", buyer.key().as_ref()],
//         bump
//     )]
//     pub purchase_account: Account<'info, PurchaseAccount>,
//     #[account(mut)]
//     pub treasury_wallet: SystemAccount<'info>,
//     pub token_program: Program<'info, token::Token>,
//     pub system_program: Program<'info, System>,
// }

// use anchor_lang::prelude::*;

// #[derive(Accounts)]
// pub struct BatchDistributeTokens<'info> {
//     #[account(mut)]
//     pub authority: Signer<'info>,
//     #[account(mut)]
//     pub ico_account: Account<'info, IcoAccount>,
//     #[account(mut)]
//     pub token_account: Account<'info, TokenAccount>, // Admin's token account
//     pub token_mint: Account<'info, Mint>, // Token mint account
//     pub token_program: Program<'info, token::Token>,
//     pub associated_token_program: Program<'info, AssociatedToken>,
//     pub system_program: Program<'info, System>,
// }

// #[derive(Accounts)]
// pub struct EndIco<'info> {
//     #[account(
//         mut,
//         seeds = [b"ico"],
//         bump
//     )]
//     pub ico_account: Account<'info, IcoAccount>,
// }

// // ICO Account Structure
// #[account]
// #[derive(Default)]
// pub struct IcoAccount {
//     pub authority: Pubkey,
//     pub total_supply: u64,
//     pub token_price: u64,
//     pub tokens_sold: u64,
//     pub start_time: i64,
//     pub duration: i64,
//     // pub duration: i64,
//     pub is_active: bool,
//     pub round_type: RoundType,
// }

// // Enhanced Error Handling
// #[error_code]
// pub enum IcoError {
//     #[msg("ICO is not currently active")]
//     IcoNotActive,
//     #[msg("Insufficient tokens remaining")]
//     InsufficientTokens,
//     #[msg("ICO is still active")]
//     IcoStillActive,
//     #[msg("You are not authorized to perform this action")]
//     Unauthorized,
//     #[msg("Purchase account not found")]
//     PurchaseAccountNotFound,
//     #[msg("Buyer token account not found")]
//     BuyerTokenAccountNotFound,
//     #[msg("Recipient and amount lists must be of equal length")]
//     BatchDistributionMismatch,
//     #[msg("Mathematical overflow occurred")]
//     MathOverflow,
// }




































// use anchor_lang::prelude::*;
// use anchor_spl::{
//     associated_token::AssociatedToken,
//     token::{self, Mint, TokenAccount, Transfer},
// };

// declare_id!("56TcuGYiK1kU1iTr1XLCYV6a4PYT8o4rqzmqvQHdEFNE");

// #[program]
// pub mod advanced_ico_program {
//     use super::*;

//     // Initialize the ICO
//     pub fn initialize(
//         ctx: Context<Initialize>,
//         total_supply: u64,
//         token_price: u64,
//         start_time: i64,
//         duration: i64,
//         round_type: RoundType,
//     ) -> Result<()> {
//         let ico = &mut ctx.accounts.ico_account;
//         ico.authority = ctx.accounts.authority.key();
//         ico.token_mint = ctx.accounts.token_mint.key();
//         ico.total_supply = total_supply;
//         ico.token_price = token_price;
//         ico.start_time = start_time;
//         ico.duration = duration;
//         ico.tokens_sold = 0;
//         ico.is_active = true;
//         ico.round_type = round_type;
//         ico.seed_investors = Vec::new();
//         ico.total_investors = 0;

//         Ok(())
//     }

//     // Update ICO parameters
//     pub fn update_ico_parameters(
//         ctx: Context<UpdateIcoParameters>,
//         total_supply: Option<u64>,
//         token_price: Option<u64>,
//         start_time: Option<i64>,
//         duration: Option<i64>,
//         round_type: Option<RoundType>,
//     ) -> Result<()> {
//         let ico = &mut ctx.accounts.ico_account;

//         require!(
//             ctx.accounts.authority.key() == ico.authority,
//             IcoError::Unauthorized
//         );

//         if let Some(supply) = total_supply {
//             ico.total_supply = supply;
//         }

//         if let Some(price) = token_price {
//             ico.token_price = price;
//         }

//         if let Some(start) = start_time {
//             ico.start_time = start;
//         }

//         if let Some(dur) = duration {
//             ico.duration = dur;
//         }

//         if let Some(round) = round_type {
//             ico.round_type = round;
//         }

//         Ok(())
//     }

//     // Add a seed investor to the whitelist
//     pub fn add_seed_investor(ctx: Context<AddSeedInvestor>, investor: Pubkey) -> Result<()> {
//         let ico = &mut ctx.accounts.ico_account;

//         require!(
//             ctx.accounts.authority.key() == ico.authority,
//             IcoError::Unauthorized
//         );

//         ico.seed_investors.push(investor);

//         Ok(())
//     }

//     // Remove a seed investor from the whitelist
//     pub fn remove_seed_investor(ctx: Context<RemoveSeedInvestor>, investor: Pubkey) -> Result<()> {
//         let ico = &mut ctx.accounts.ico_account;

//         require!(
//             ctx.accounts.authority.key() == ico.authority,
//             IcoError::Unauthorized
//         );

//         if let Some(index) = ico.seed_investors.iter().position(|&x| x == investor) {
//             ico.seed_investors.remove(index);
//         }

//         Ok(())
//     }

//     // Buy tokens during the ICO
//     pub fn buy_tokens(ctx: Context<BuyTokens>, amount: u64) -> Result<()> {
//         let current_time = Clock::get()?.unix_timestamp;
//         let ico = &mut ctx.accounts.ico_account;

//         require!(
//             ico.is_active
//                 && current_time >= ico.start_time
//                 && current_time < ico.start_time + ico.duration,
//             IcoError::IcoNotActive
//         );

//         if ico.round_type == RoundType::SeedRound {
//             require!(
//                 ico.seed_investors.contains(&ctx.accounts.buyer.key()),
//                 IcoError::NotWhitelisted
//             );
//         }

//         require!(
//             ico.tokens_sold + amount <= ico.total_supply,
//             IcoError::InsufficientTokens
//         );

//         let total_cost = amount
//             .checked_mul(ico.token_price)
//             .ok_or(IcoError::MathOverflow)?;

//         let transfer_context = CpiContext::new(
//             ctx.accounts.system_program.to_account_info(),
//             anchor_lang::system_program::Transfer {
//                 from: ctx.accounts.buyer.to_account_info(),
//                 to: ctx.accounts.treasury_wallet.to_account_info(),
//             },
//         );
//         anchor_lang::system_program::transfer(transfer_context, total_cost)?;

//         let purchase = &mut ctx.accounts.purchase_account;
//         purchase.buyer = ctx.accounts.buyer.key();
//         purchase.amount = purchase
//             .amount
//             .checked_add(amount)
//             .ok_or(IcoError::MathOverflow)?;
//         purchase.is_distributed = false;

//         ico.tokens_sold = ico
//             .tokens_sold
//             .checked_add(amount)
//             .ok_or(IcoError::MathOverflow)?;
            
//         ico.total_investors = ico.total_investors.checked_add(1).ok_or(IcoError::MathOverflow)?;

//         emit!(TokenPurchaseEvent {
//             buyer: ctx.accounts.buyer.key(),
//             amount,
//             price: ico.token_price,
//             round_type: ico.round_type.clone(),
//         });

//         Ok(())
//     }

//     // Batch distribute tokens to buyers
//     pub fn distribute_tokens(ctx: Context<DistributeTokens>) -> Result<()> {
//         let ico = &ctx.accounts.ico_account;
//         let remaining_accounts = &ctx.remaining_accounts;

//         require!(!ico.is_active, IcoError::IcoStillActive);
//         require!(
//             ctx.accounts.authority.key() == ico.authority,
//             IcoError::Unauthorized
//         );

//         // Each buyer needs 2 accounts: token account and purchase account
//         require!(
//             remaining_accounts.len() % 2 == 0,
//             IcoError::InvalidRemainingAccounts
//         );

//         let mut distributed_amount = 0;

//         // Process buyers in pairs (token account + purchase account)
//         for chunk in remaining_accounts.chunks(2) {
//             if let [buyer_token_account, purchase_account] = chunk {
//                 // Deserialize purchase account
//                 let purchase = Account::<PurchaseAccount>::try_from(purchase_account)?;
                
//                 // Skip if already distributed
//                 if purchase.is_distributed {
//                     continue;
//                 }

//                 // Verify buyer token account ownership
//                 let token_account = Account::<TokenAccount>::try_from(buyer_token_account)?;
//                 require!(
//                     token_account.owner == purchase.buyer,
//                     IcoError::InvalidTokenAccount
//                 );

//                 // Transfer tokens
//                 let transfer_context = CpiContext::new(
//                     ctx.accounts.token_program.to_account_info(),
//                     Transfer {
//                         from: ctx.accounts.treasury_token_account.to_account_info(),
//                         to: buyer_token_account.clone(),
//                         authority: ctx.accounts.authority.to_account_info(),
//                     },
//                 );
//                 token::transfer(transfer_context, purchase.amount)?;

//                 // Update purchase account
//                 let mut purchase = Account::<PurchaseAccount>::try_from(purchase_account)?;
//                 purchase.is_distributed = true;
//                 purchase.exit(&crate::ID)?;

//                 distributed_amount = distributed_amount
//                     .checked_add(purchase.amount)
//                     .ok_or(IcoError::MathOverflow)?;

//                 emit!(TokenDistributionEvent {
//                     buyer: purchase.buyer,
//                     amount: purchase.amount,
//                     timestamp: Clock::get()?.unix_timestamp,
//                 });
//             }
//         }

//         require!(distributed_amount > 0, IcoError::NoTokensDistributed);

//         Ok(())
//     }

//     // End the ICO
//     pub fn end_ico(ctx: Context<EndIco>) -> Result<()> {
//         let ico = &mut ctx.accounts.ico_account;
//         let current_time = Clock::get()?.unix_timestamp;

//         require!(
//             current_time >= ico.start_time + ico.duration,
//             IcoError::IcoStillActive
//         );

//         ico.is_active = false;
//         Ok(())
//     }

//     // Get seed investors (utility function)
//     pub fn get_seed_investors(ctx: Context<GetSeedInvestors>) -> Result<()> {
//         let ico = &ctx.accounts.ico_account;
//         msg!("Number of seed investors: {}", ico.seed_investors.len());
//         for (index, investor) in ico.seed_investors.iter().enumerate() {
//             msg!("Seed Investor {}: {}", index + 1, investor);
//         }

//         Ok(())
//     }
// }

// // Fundraising Round Types
// #[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq)]
// pub enum RoundType {
//     SeedRound,
//     PreICO,
//     PublicICO,
// }

// impl Default for RoundType {
//     fn default() -> Self {
//         RoundType::SeedRound
//     }
// }

// // Events
// #[event]
// pub struct TokenPurchaseEvent {
//     pub buyer: Pubkey,
//     pub amount: u64,
//     pub price: u64,
//     pub round_type: RoundType,
// }

// #[event]
// pub struct TokenDistributionEvent {
//     pub buyer: Pubkey,
//     pub amount: u64,
//     pub timestamp: i64,
// }

// // Purchase Account
// #[account]
// #[derive(Default)]
// pub struct PurchaseAccount {
//     pub buyer: Pubkey,
//     pub amount: u64,
//     pub is_distributed: bool,
// }

// // ICO Account
// #[account]
// #[derive(Default)]
// pub struct IcoAccount {
//     pub authority: Pubkey,
//     pub token_mint: Pubkey,
//     pub total_supply: u64,
//     pub token_price: u64,
//     pub tokens_sold: u64,
//     pub start_time: i64,
//     pub duration: i64,
//     pub is_active: bool,
//     pub round_type: RoundType,
//     pub seed_investors: Vec<Pubkey>,
//     pub total_investors: u64,
// }

// // Account Structs
// #[derive(Accounts)]
// pub struct Initialize<'info> {
//     #[account(mut)]
//     pub authority: Signer<'info>,
//     #[account(
//         init, 
//         payer = authority, 
//         space = 8 + 32 + 32 + 8 + 8 + 8 + 8 + 8 + 1 + 1 + 4 + (32 * 100) + 8,
//         seeds = [b"ico"],
//         bump
//     )]
//     pub ico_account: Account<'info, IcoAccount>,
//     #[account(mut)]
//     pub token_mint: Account<'info, Mint>,
//     pub system_program: Program<'info, System>,
// }

// #[derive(Accounts)]
// pub struct UpdateIcoParameters<'info> {
//     #[account(mut)]
//     pub authority: Signer<'info>,
//     #[account(
//         mut,
//         seeds = [b"ico"],
//         bump
//     )]
//     pub ico_account: Account<'info, IcoAccount>,
// }

// #[derive(Accounts)]
// pub struct BuyTokens<'info> {
//     #[account(mut)]
//     pub buyer: Signer<'info>,
//     #[account(
//         mut,
//         seeds = [b"ico"],
//         bump
//     )]
//     pub ico_account: Account<'info, IcoAccount>,
//     #[account(
//         init_if_needed,
//         payer = buyer, 
//         space = 8 + 32 + 8 + 1,
//         seeds = [b"purchase", buyer.key().as_ref()],
//         bump
//     )]
//     pub purchase_account: Account<'info, PurchaseAccount>,
//     #[account(mut)]
//     pub treasury_wallet: SystemAccount<'info>,
//     pub token_program: Program<'info, token::Token>,
//     pub system_program: Program<'info, System>,
// }

// #[derive(Accounts)]
// pub struct DistributeTokens<'info> {
//     #[account(mut)]
//     pub authority: Signer<'info>,
//     #[account(
//         mut,
//         seeds = [b"ico"],
//         bump
//     )]
//     pub ico_account: Account<'info, IcoAccount>,
//     #[account(mut)]
//     pub treasury_token_account: Account<'info, TokenAccount>,
//     pub token_program: Program<'info, token::Token>,
// }

// #[derive(Accounts)]
// pub struct EndIco<'info> {
//     #[account(
//         mut,
//         seeds = [b"ico"],
//         bump
//     )]
//     pub ico_account: Account<'info, IcoAccount>,
// }

// #[derive(Accounts)]
// pub struct AddSeedInvestor<'info> {
//     #[account(mut)]
//     pub authority: Signer<'info>,
//     #[account(
//         mut,
//         seeds = [b"ico"],
//         bump
//     )]
//     pub ico_account: Account<'info, IcoAccount>,
// }

// #[derive(Accounts)]
// pub struct RemoveSeedInvestor<'info> {
//     #[account(mut)]
//     pub authority: Signer<'info>,
//     #[account(
//         mut,
//         seeds = [b"ico"],
//         bump
//     )]
//     pub ico_account: Account<'info, IcoAccount>,
// }

// #[derive(Accounts)]
// pub struct GetSeedInvestors<'info> {
//     #[account(
//         seeds = [b"ico"],
//         bump
//     )]
//     pub ico_account: Account<'info, IcoAccount>,
// }

// // Error Handling
// #[error_code]
// pub enum IcoError {
//     #[msg("ICO is not currently active")]
//     IcoNotActive,
//     #[msg("Insufficient tokens remaining")]
//     InsufficientTokens,
//     #[msg("ICO is still active")]
//     IcoStillActive,
//     #[msg("You are not authorized to perform this action")]
//     Unauthorized,
//     #[msg("Purchase account not found")]
//     PurchaseAccountNotFound,
//     #[msg("Buyer token account not found")]
//     BuyerTokenAccountNotFound,
//     #[msg("Mathematical overflow occurred")]
//     MathOverflow,
//     #[msg("Investor is not whitelisted for the seed round")]
//     NotWhitelisted,
//     #[msg("Invalid remaining accounts provided")]
//     InvalidRemainingAccounts,
//     #[msg("Invalid token account owner")]
//     InvalidTokenAccount,
//     #[msg("No tokens were distributed")]
//     NoTokensDistributed,
// }




































































// use anchor_lang::prelude::*;
// use anchor_spl::token::{self, TokenAccount, Transfer};

// declare_id!("GPW34eu3rbyGriHnsGiPzpNdY28KuyHUqM7PTUFikTXT");

// #[program]
// pub mod simple_ico_program {
//     use super::*;

//     // Initialize the ICO
//     pub fn initialize(
//         ctx: Context<Initialize>,
//         total_supply: u64,
//         token_price: u64,
//         start_time: i64,
//         duration: i64,
//     ) -> Result<()> {
//         let ico = &mut ctx.accounts.ico_account;

//         ico.authority = ctx.accounts.authority.key();
//         ico.total_supply = total_supply;
//         ico.token_price = token_price;
//         ico.start_time = start_time;
//         ico.duration = duration;
//         ico.tokens_sold = 0;
//         ico.is_active = true;

//         Ok(())
//     }

//     pub fn update_ico_details(
//         ctx: Context<UpdateIcoDetails>,
//         total_supply: u64,
//         token_price: u64,
//         start_time: i64,
//         duration: i64,
//     ) -> Result<()> {
//         let ico = &mut ctx.accounts.ico_account;

//         // Ensure only the authority can update details
//         require!(
//             ctx.accounts.authority.key() == ico.authority,
//             IcoError::Unauthorized
//         );

//         // Update details
//         ico.total_supply = total_supply;
//         ico.token_price = token_price;
//         ico.start_time = start_time;
//         ico.duration = duration;

//         Ok(())
//     }

//     // Buy tokens during the ICO
//     pub fn buy_tokens(ctx: Context<BuyTokens>, amount: u64) -> Result<()> {
//         let current_time = Clock::get()?.unix_timestamp;

//         // Extract authority info before mutable borrow
//         let authority_info = ctx.accounts.ico_account.to_account_info();

//         // Mutable borrow for `ico_account`
//         let ico = &mut ctx.accounts.ico_account;

//         // Check if ICO is active
//         require!(
//             ico.is_active
//                 && current_time >= ico.start_time
//                 && current_time < ico.start_time + ico.duration,
//             IcoError::IcoNotActive
//         );

//         // Check remaining supply
//         require!(
//             ico.tokens_sold + amount <= ico.total_supply,
//             IcoError::InsufficientTokens
//         );

//         // Calculate total cost
//         let total_cost = amount * ico.token_price;

//         msg!("Token Price: {}", ico.token_price);
//         msg!("Amount: {}", amount);
//         msg!("Total Cost: {}", total_cost);

//         // Transfer SOL from buyer to treasury
//         let transfer_context = CpiContext::new(
//             ctx.accounts.system_program.to_account_info(),
//             anchor_lang::system_program::Transfer {
//                 from: ctx.accounts.buyer.to_account_info(),
//                 to: ctx.accounts.treasury_wallet.to_account_info(),
//             },
//         );
//         anchor_lang::system_program::transfer(transfer_context, total_cost)?;

//         // Prepare signer seeds and extend lifetime
//         let signer_seeds: &[&[u8]] = &[b"ico".as_slice(), &[ctx.bumps.ico_account]];
//         let signer_seeds_arr = &[signer_seeds]; // Ensure it lives long enough

//         // Transfer tokens to buyer
//         let token_transfer_context = CpiContext::new_with_signer(
//             ctx.accounts.token_program.to_account_info(),
//             Transfer {
//                 from: ctx.accounts.token_account.to_account_info(),
//                 to: ctx.accounts.buyer_token_account.to_account_info(),
//                 authority: ctx.accounts.authority.to_account_info(),
//             },
//             signer_seeds_arr,
//         );
//         token::transfer(token_transfer_context, amount)?;

//         // Update tokens sold
//         ico.tokens_sold += amount;

//         // Emit purchase event
//         emit!(TokenPurchaseEvent {
//             buyer: ctx.accounts.buyer.key(),
//             amount,
//             price: ico.token_price
//         });

//         Ok(())
//     }

//     // End the ICO
//     pub fn end_ico(ctx: Context<EndIco>) -> Result<()> {
//         let ico = &mut ctx.accounts.ico_account;
//         let current_time = Clock::get()?.unix_timestamp;

//         require!(
//             current_time >= ico.start_time + ico.duration,
//             IcoError::IcoStillActive
//         );

//         ico.is_active = false;

//         Ok(())
//     }
// }

// // Token Purchase Event
// #[event]
// pub struct TokenPurchaseEvent {
//     pub buyer: Pubkey,
//     pub amount: u64,
//     pub price: u64,
// }

// #[derive(Accounts)]
// pub struct UpdateIcoDetails<'info> {
//     #[account(mut)]
//     pub authority: Signer<'info>,

//     #[account(
//         mut,
//         seeds = [b"ico"],
//         bump
//     )]
//     pub ico_account: Account<'info, IcoAccount>,
// }

// // Account Structs
// #[derive(Accounts)]
// pub struct Initialize<'info> {
//     #[account(mut)]
//     pub authority: Signer<'info>,

//     #[account(
//         init, 
//         payer = authority, 
//         space = 8 + 32 + 8 * 6 + 1,
//         seeds = [b"ico"],
//         bump
//     )]
//     pub ico_account: Account<'info, IcoAccount>,

//     pub system_program: Program<'info, System>,
// }

// #[derive(Accounts)]
// pub struct BuyTokens<'info> {
//     #[account(mut)]
//     pub buyer: Signer<'info>,

//     #[account(
//         mut,
//         seeds = [b"ico"],
//         bump,
//         // Add this constraint to explicitly set the token account's authority
//         has_one = authority 
//     )]
//     pub ico_account: Account<'info, IcoAccount>,
//     /// CHECK: This will be the authority for the token account
//     pub authority: AccountInfo<'info>,

//     #[account(mut)]
//     pub treasury_wallet: SystemAccount<'info>,

//     #[account(
//         mut,
//         token::authority = authority // Ensure the token account is owned by the PDA
//     )]
//     pub token_account: Account<'info, TokenAccount>,

//     #[account(mut)]
//     pub buyer_token_account: Account<'info, TokenAccount>,

//     pub token_program: Program<'info, token::Token>,
//     pub system_program: Program<'info, System>,
// }

// #[derive(Accounts)]
// pub struct EndIco<'info> {
//     #[account(
//         mut,
//         seeds = [b"ico"],
//         bump
//     )]
//     pub ico_account: Account<'info, IcoAccount>,
// }

// // ICO Account Structure
// #[account]
// #[derive(Default)]
// pub struct IcoAccount {
//     pub authority: Pubkey,
//     pub total_supply: u64,
//     pub token_price: u64,
//     pub tokens_sold: u64,
//     pub start_time: i64,
//     pub duration: i64,
//     pub is_active: bool,
// }

// // Error Handling
// #[error_code]
// pub enum IcoError {
//     #[msg("ICO is not currently active")]
//     IcoNotActive,
//     #[msg("Insufficient tokens remaining")]
//     InsufficientTokens,
//     #[msg("ICO is still active")]
//     IcoStillActive,
//     #[msg("You are not authorized to perform this action")]
//     Unauthorized,
// }

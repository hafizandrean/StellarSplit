#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, contracterror, Env, Address, String, symbol_short};

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum Error {
    BillNotFound = 1,
    InvalidAmount = 2,
    AlreadyPaid = 3,
    AmountTooLarge = 4,
    InvalidTitle = 5,
    InvalidParticipants = 6,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Bill {
    pub id: u32,
    pub creator: Address,
    pub title: String,
    pub total_amount: u64,
    pub paid_amount: u64,
    pub participants_count: u32,
    pub created_at: u64,
    pub is_paid: bool,
}

#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    Counter,
    Bill(u32),
}

#[contract]
pub struct StellarSplitContract;

#[contractimpl]
impl StellarSplitContract {
    /// Creates a new split bill on-chain.
    /// Emits a 'create' event.
    pub fn create_bill(
        env: Env,
        creator: Address,
        title: String,
        total_amount: u64,
        participants_count: u32,
    ) -> Result<u32, Error> {
        // Enforce creator authorization
        creator.require_auth();

        // Validations
        if title.len() > 64 {
            return Err(Error::InvalidTitle);
        }
        if total_amount == 0 {
            return Err(Error::InvalidAmount);
        }
        if participants_count == 0 {
            return Err(Error::InvalidParticipants);
        }

        // Get and increment ID counter
        let mut id: u32 = env.storage().instance().get(&DataKey::Counter).unwrap_or(0);
        id += 1;
        env.storage().instance().set(&DataKey::Counter, &id);

        // Build the bill details
        let bill = Bill {
            id,
            creator: creator.clone(),
            title,
            total_amount,
            paid_amount: 0,
            participants_count,
            created_at: env.ledger().timestamp(),
            is_paid: false,
        };

        // Write to storage
        env.storage().persistent().set(&DataKey::Bill(id), &bill);

        // Publish creation event
        // Topic: symbol_short!("create"), Payload: (id, creator)
        env.events().publish(
            (symbol_short!("create"),),
            (id, creator),
        );

        Ok(id)
    }

    /// Retrieves an existing bill from storage.
    pub fn get_bill(env: Env, bill_id: u32) -> Result<Bill, Error> {
        let key = DataKey::Bill(bill_id);
        if !env.storage().persistent().has(&key) {
            return Err(Error::BillNotFound);
        }
        Ok(env.storage().persistent().get(&key).unwrap())
    }

    /// Pays a share towards an existing bill.
    /// Emits a 'pay' event.
    pub fn pay_bill(
        env: Env,
        bill_id: u32,
        amount: u64,
        payer: Address,
    ) -> Result<Bill, Error> {
        // Enforce payer authorization
        payer.require_auth();

        // Retrieve the bill
        let key = DataKey::Bill(bill_id);
        if !env.storage().persistent().has(&key) {
            return Err(Error::BillNotFound);
        }

        let mut bill: Bill = env.storage().persistent().get(&key).unwrap();

        // Validations
        if amount == 0 {
            return Err(Error::InvalidAmount);
        }
        if bill.is_paid {
            return Err(Error::AlreadyPaid);
        }

        // Check for paid overflow/limit
        let remaining = bill.total_amount.checked_sub(bill.paid_amount).ok_or(Error::AmountTooLarge)?;
        if amount > remaining {
            return Err(Error::AmountTooLarge);
        }

        // Update the payment states
        bill.paid_amount += amount;
        if bill.paid_amount >= bill.total_amount {
            bill.is_paid = true;
        }

        // Save updated bill back to storage
        env.storage().persistent().set(&key, &bill);

        // Publish payment event
        // Topic: symbol_short!("pay"), Payload: (bill_id, payer, amount)
        env.events().publish(
            (symbol_short!("pay"),),
            (bill_id, payer, amount),
        );

        Ok(bill)
    }
}

import { nat64, $query, $update, ic } from 'azle';

// Define the type for an account containing address and balance
type Account = {
    address: string;
    balance: nat64;
};

// Define the type for the contract state
type State = {
    accounts: {
        [key: string]: Account;
    };
    name: string;
    ticker: string;
    totalSupply: nat64;
};

// Initialize the state with default values
let state: State = {
    accounts: {},
    name: "",
    ticker: "",
    totalSupply: 0n,
};

// Update function to initialize the token supply
$update;
export function initializeSupply(
    name: string,
    originalAddress: string,
    ticker: string,
    totalSupply: nat64
): boolean {
    // Check for valid input here (e.g., valid name, ticker, and totalSupply)
    // Note: Input validation logic can be added here to ensure valid data.

    // Update the contract state with the provided data
    state = {
        ...state,
        accounts: {
            [originalAddress]: {
                address: originalAddress,
                balance: totalSupply,
            },
        },
        name,
        ticker,
        totalSupply,
    };

    // Return true to indicate successful initialization
    return true;
}

// Update function to transfer tokens between accounts
$update;
export function transfer(
    fromAddress: string,
    toAddress: string,
    amount: nat64
): boolean {
    // Check if the "toAddress" account exists, if not, create one with a balance of 0
    if (state.accounts[toAddress] === undefined) {
        state.accounts[toAddress] = {
            address: toAddress,
            balance: 0n
        };
    }

    // Check if the "fromAddress" account exists, if not, create one with a balance of 0
    if (state.accounts[fromAddress] === undefined) {
        state.accounts[fromAddress] = {
            address: fromAddress,
            balance: 0n
        };
    }

    // Get the balance of the "fromAddress" account
    const fromBalance = state.accounts[fromAddress].balance;

    // Check if the account has sufficient balance to transfer the specified amount
    if (fromBalance < amount) {
        // Trap with an error message if the amount is insufficient
        ic.trap("Insufficient amount")
    }

    // Update the balances of the accounts after the transfer
    state.accounts[fromAddress].balance -= amount;
    state.accounts[toAddress].balance += amount;

    // Return true to indicate a successful transfer
    return true;
}

// Query function to get the balance of an account
$query;
export function balance(address: string): nat64 {
    // Return the balance of the specified account or 0 if the account doesn't exist
    return state.accounts[address]?.balance ?? 0n;
}

// Query function to get the token ticker
$query;
export function getTicker(): string {
    // Return the token ticker
    return state.ticker;
}

// Query function to get the token name
$query;
export function getName(): string {
    // Return the token name
    return state.name;
}

// Query function to get the total token supply
$query;
export function getTotalSupply(): nat64 {
    // Return the total token supply
    return state.totalSupply;
}

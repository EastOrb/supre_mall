import { nat64, $query, $update, ic } from 'azle';

type Account = {
    address: string;
    balance: nat64;
};

type State = {
    accounts: {
        [key: string]: Account;
    };
    name: string;
    ticker: string;
    totalSupply: nat64;
};

let state: State = {
    accounts: {},
    name: "",
    ticker: "",
    totalSupply: 0n,
};

// Update functions

$update;
export function initializeSupply(
    name: string,
    originalAddress: string,
    ticker: string,
    totalSupply: nat64
): boolean {
    // Check for valid input here (e.g., valid name, ticker, and totalSupply)

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

    return true;
}

$update;
export function transfer(
    fromAddress: string,
    toAddress: string,
    amount: nat64
): boolean {
    // Check for valid input here (e.g., valid addresses, non-negative amount, etc.)

    const fromAccount = state.accounts[fromAddress] ?? {
        address: fromAddress,
        balance: 0n,
    };
    const toAccount = state.accounts[toAddress] ?? {
        address: toAddress,
        balance: 0n,
    };

    if (fromAccount.balance < amount) {
        ic.trap("Insufficient amount");
    }

    // Perform the transfer using BigInt arithmetic methods
    state.accounts[fromAddress].balance = fromAccount.balance - amount;
    state.accounts[toAddress].balance = toAccount.balance + amount;

    return true;
}

// Query functions

$query;
export function balance(address: string): nat64 {
    return state.accounts[address]?.balance ?? 0n;
}

$query;
export function getTicker(): string {
    return state.ticker;
}

$query;
export function getName(): string {
    return state.name;
}

$query;
export function getTotalSupply(): nat64 {
    return state.totalSupply;
}

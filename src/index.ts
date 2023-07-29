// cannister code goes here
import { $query, $update, Record, StableBTreeMap, Vec, match, Result, nat64, ic, Opt, Principal, serviceQuery, serviceUpdate, CallResult, Service, int8 } from 'azle';
import { v4 as uuidv4 } from 'uuid';
import {Address} from 'azle/canisters/ledger';


export class Token extends Service {
    @serviceUpdate
    initializeSupply: ( name: string, originalAddress: string, ticker: string,totalSupply: nat64) => CallResult<boolean>;

    @serviceUpdate
    transfer: (from: string, to: string, amount: nat64) => CallResult<boolean>;

    @serviceQuery
    balance: (id: string) => CallResult<nat64>;

    @serviceQuery
    ticker: () => CallResult<string>;

    @serviceQuery
    name: () => CallResult<string>;

    @serviceQuery
    totalSupply: () => CallResult<nat64>;
}


type Product = Record<{
    id: string;
    name: string;
    description: string;
    price: nat64;
    sold: number;
    attachmentURL: string;
    likes: number;
    feedbacks: Vec<Feedback>;
    createdAt: nat64;
    updatedAt: Opt<nat64>;
    author: Principal;
}>

type ProductPayload = Record<{
    name: string;
    description: string;
    price: nat64;
    attachmentURL: string;
}>
type Feedback = Record<{
    id: string;
    content: string;
    author: Principal;
    createdAt: nat64;
  }>;

type FeedbackPayload = Record<{
    content: string;
}>;
export type initPayload = Record<{
    // network: local:0 or mainnet:1
    network: int8
}>




const icpCanisterAddress: Address = ic.caller().toString()

const tokenCanister = new Token(
    // input your token canister address
    Principal.fromText("bd3sg-teaaa-aaaaa-qaaba-cai")
);

// set up with wallet of local user 
const owner: Principal = ic.caller();

let initialized: boolean;
let mallBal: nat64;
let network: int8;


const productStorage = new StableBTreeMap<string, Product>(0, 44, 1024);
mallBal = 0n;


// initialization function
$update;
export async function initializeToken(payload: initPayload):  Promise<Result<string, string>>{
    if(initialized){
        ic.trap("Canister already initialized")
    }

    if (payload.network == 0){
        //set up dummyTokens
       network = 0;
       await tokenCanister.initializeSupply('SupreMallToken', icpCanisterAddress, 'SMT', 1_000_000_000_000n).call();
    }else{
       network = 1;
    }

    initialized = true;
    mallBal = 0n;
    return Result.Ok<string, string>("Canister Initialized");
}


// function to get your wallet address
$query;
export function wallet(): string {
    return ic.caller().toString();
}

// function to get the mall's balance
$query;
export function mallBalance(): nat64 {
    return mallBal;
}

$query;
export function mallOwner(): string {
    return owner.toString();
}

// function to get your account balance
$query;
export async function walletBalanceLocal(): Promise<Result<nat64, string>> {
    let address = ic.caller().toString();
    return await tokenCanister.balance(address).call();
}

//function to get all products
$query;
export function getProducts(): Result<Vec<Product>, string> {
    return Result.Ok(productStorage.values());
}

// function to get product by its id
$query;
export function getProduct(id: string): Result<Product, string> {
    return match(productStorage.get(id), {
        Some: (product) => Result.Ok<Product, string>(product),
        None: () => Result.Err<Product, string>(`Product with id=${id} not found`)
    });
}

// function to add product
$update;
export function addProduct(payload: ProductPayload): Result<Product, string> {
    const product: Product = {
      id: uuidv4(),
      name: payload.name,
      description: payload.description,
      price: payload.price,
      sold: 0,
      attachmentURL: payload.attachmentURL,
      likes: 0,
      feedbacks: [],
      createdAt: ic.time(),
      updatedAt: Opt.None,
      author: ic.caller(),
    };
    productStorage.insert(product.id, product);
    return Result.Ok(product);
  }

$update;
export function updateProduct(id: string, payload: ProductPayload): Result<Product, string> {
    return match(productStorage.get(id), {
        Some: (product) => {
            if (product.author.toString() !== ic.caller().toString()) {
                return Result.Err<Product, string>("You are not the owner of this product");
              }
            const updatedProduct: Product = {...product, ...payload, updatedAt: Opt.Some(ic.time())};
            productStorage.insert(product.id, updatedProduct);
            return Result.Ok<Product, string>(updatedProduct);
        },
        None: () => Result.Err<Product, string>(`Couldn't update Product with id=${id}. Product not found`)
    });
}

$update;
export function updatePrice(id: string, price: nat64): Result<Product, string> {
    return match(productStorage.get(id), {
        Some: (product) => {
            if (product.author.toString() !== ic.caller().toString()) {
                return Result.Err<Product, string>("You are not the owner of this product");
              }
            const updatedProduct: Product = {...product, price, updatedAt: Opt.Some(ic.time())};
            productStorage.insert(product.id, updatedProduct);
            return Result.Ok<Product, string>(updatedProduct);
        },
        None: () => Result.Err<Product, string>(`Couldn't update Product with id=${id}. Product not found`)
    });
}

$update;
export function addReview(
    productId: string,
    payload: FeedbackPayload
  ): Result<Product, string> {
    return match(productStorage.get(productId), {
      Some: (product) => {
        const feedback: Feedback = {id: uuidv4(), content: payload.content, author: ic.caller(),createdAt: ic.time(),};
        const updatedproduct: Product = {...product, feedbacks: [...product.feedbacks, feedback],};
        productStorage.insert(product.id, updatedproduct);
        return Result.Ok<Product, string>(updatedproduct);
      },
      None: () => Result.Err<Product, string>(`Product with id=${productId} not found`),
    });
  }

$update;
export function likeProduct(
    productId: string
    ): Result<Product, string> {
    return match(productStorage.get(productId), {
        Some: (product) => {
            const updatedproduct: Product = {...product, likes: product.likes + 1};
            productStorage.insert(product.id, updatedproduct);
            return Result.Ok<Product, string>(updatedproduct);
        },
        None: () => Result.Err<Product, string>(`Product with id=${productId} not found`),
    });
}

$update;
export async function buyProduct(
    productId: string
    ): Promise<Result<Product, string>>{
    // check if initialized
    if(!initialized){
        ic.trap("Canister not yet initialized")
    }
    return match(productStorage.get(productId), {
        Some: async (product) => {
            let status = (await tokenCanister.transfer(ic.caller().toString(), icpCanisterAddress, product.price).call()).Ok;   
        if(!status){
            ic.trap("Failed to purchase product")
        }
            const updatedproduct: Product = {...product, sold: product.sold + 1};
            mallBal = mallBal + product.price;
            productStorage.insert(product.id, updatedproduct);
            return Result.Ok<Product, string>(updatedproduct);
        },
        None: () => Result.Err<Product, string>(`Product with id=${productId} not found`),
    });
}

$update;
export function deleteProduct(id: string): Result<Product, string> {
    return match(productStorage.remove(id), {
        Some: (deletedProduct) => Result.Ok<Product, string>(deletedProduct),
        None: () => Result.Err<Product, string>(`couldn't delete a Product with id=${id}. Product not found.`)
    });
}

// function to get dummy tokens to your wallet
$update;
export async function getFaucetTokens(): Promise<Result<boolean, string>>{
    // if(!initialized){
    //     await initializeToken({network: 0});
    // }
    const caller = ic.caller();
    return await tokenCanister.transfer(icpCanisterAddress, caller.toString(), 1000n).call();   
}

// a workaround to make uuid package work with Azle
globalThis.crypto = {
    getRandomValues: () => {
        let array = new Uint8Array(32);

        for (let i = 0; i < array.length; i++) {
            array[i] = Math.floor(Math.random() * 256);
        }

        return array;
    }
};
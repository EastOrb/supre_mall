// cannister code goes here
import { $query, $update, Record, StableBTreeMap, Vec, match, Result, nat64, ic, Opt, Principal } from 'azle';
import { v4 as uuidv4 } from 'uuid';

type Product = Record<{
    id: string;
    name: string;
    description: string;
    price: number;
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
    price: number;
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

const productStorage = new StableBTreeMap<string, Product>(0, 44, 1024);

$query;
export function getProducts(): Result<Vec<Product>, string> {
    return Result.Ok(productStorage.values());
}

$query;
export function getProduct(id: string): Result<Product, string> {
    return match(productStorage.get(id), {
        Some: (product) => Result.Ok<Product, string>(product),
        None: () => Result.Err<Product, string>(`Product with id=${id} not found`)
    });
}

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
export function updatePrice(id: string, price: number): Result<Product, string> {
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
export function buyProduct(
    productId: string
    ): Result<Product, string> {
    return match(productStorage.get(productId), {
        Some: (product) => {
            const updatedproduct: Product = {...product, sold: product.sold + 1};
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
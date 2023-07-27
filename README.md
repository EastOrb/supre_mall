# Supre_Mall 

SupreMall is an online marketplace allowing users to list and purchase their products.
It is built on two canisters, a Token and a SupreMall canister. 

## Testing Instructions 

- Make sure you have the required environment for running ICP canisters and the dfx is running in background `dfx start --background --clean`
- Deploy the canisters `dfx deploy`
- Note the token canister id on your console, if it's different from `bd3sg-teaaa-aaaaa-qaaba-cai`, change it to the one you have (the one generated on your console) in line 70 of the `index.ts` then run `dfx deploy` again.
<pre>
Created the "default" identity.
Deploying all canisters.
Creating a wallet canister on the local network.
The wallet canister on the "local" network for user "default" is "bnz7o-iuaaa-aaaaa-qaaaa-cai"
Creating canisters...
Creating canister supremall...
supremall canister created with canister id: bkyz2-fmaaa-aaaaa-qaaaq-cai
Creating canister token...
token canister created with canister id: bd3sg-teaaa-aaaaa-qaaba-cai
Building canisters...
</pre>
- If the token canister id is fixed, your canister should have been deployed and you should have a similar response
<pre>
  Installing canisters...
Creating UI canister on the local network.
The UI canister on the "local" network is "be2us-64aaa-aaaaa-qaabq-cai"
Installing code for canister supremall, with canister ID bkyz2-fmaaa-aaaaa-qaaaq-cai
Installing code for canister token, with canister ID bd3sg-teaaa-aaaaa-qaaba-cai
Deployed canisters.
URLs:
  Backend canister via Candid interface:
    supremall: http://127.0.0.1:4943/?canisterId=be2us-64aaa-aaaaa-qaabq-cai&id=bkyz2-fmaaa-aaaaa-qaaaq-cai
    token: http://127.0.0.1:4943/?canisterId=be2us-64aaa-aaaaa-qaabq-cai&id=bd3sg-teaaa-aaaaa-qaaba-cai
</pre>
- Click on the link to the supremall canister, once the UI has been loaded.
- Call the `initializeToken` function with a value of 0 to create the dummy token on the local network.
- Call the `getFaucetTokens` function and you should receive a dummy token of `1000 SMT` for testing purposes.
- You can now call the `addProduct` function to add products to the mall and also carry out other operations like `purchasing`, `reviewing`, `like` and `deleting` products.

## AUTHOR
Alade Toheeb Olamilekan 

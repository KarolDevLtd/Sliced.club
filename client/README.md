# Create T3 App

This is a [T3 Stack](https://create.t3.gg/) project bootstrapped with `create-t3-app`.

## What's next? How do I make an app with this?

We try to keep this project as simple as possible, so you can start with just the scaffolding we set up for you, and add additional things later when they become necessary.

If you are not familiar with the different technologies used in this project, please refer to the respective docs. If you still are in the wind, please join our [Discord](https://t3.gg/discord) and ask for help.

-   [Next.js](https://nextjs.org)
-   [NextAuth.js](https://next-auth.js.org)
-   [Prisma](https://prisma.io)
-   [Drizzle](https://orm.drizzle.team)
-   [Tailwind CSS](https://tailwindcss.com)
-   [tRPC](https://trpc.io)

## Learn More

To learn more about the [T3 Stack](https://create.t3.gg/), take a look at the following resources:

-   [Documentation](https://create.t3.gg/)
-   [Learn the T3 Stack](https://create.t3.gg/en/faq#what-learning-resources-are-currently-available) — Check out these awesome tutorials

You can check out the [create-t3-app GitHub repository](https://github.com/t3-oss/create-t3-app) — your feedback and contributions are welcome!

## How do I deploy this?

Follow our deployment guides for [Vercel](https://create.t3.gg/en/deployment/vercel), [Netlify](https://create.t3.gg/en/deployment/netlify) and [Docker](https://create.t3.gg/en/deployment/docker) for more information.

## How to make contracts work for now?

-   go to contracts folder, run `npm i`, `npm run build` and `npm pack` - that will create .tgz file
-   go to client folder and import the .tgz file in package.json
-   example: `"sliced-contracts": "/Users/karol/Documents/Sliced.club/contracts/sliced-contracts-0.1.0.tgz"`
-   if u get integrity error, try to change name of the tgz 0.1.x
-   run `npm i`

-   if connecting to lightnet
-   ensure you have the latests zkapp-cli `npm i -g zkapp-cli`
-   run `zk lightnet start -b develop`

-   in Auro wallet click hamburger menu, networks, add network, name it 'lightnet' and paste the url `http://localhost:8080/graphql` and save
-   ensure network is switched to lightnet
-
-   when running go in your browser to `http://localhost:8181/acquire-account`
-   copy the 'sk' value
-   in Auro wallet click top right for wallets, then add account, then private key, give a name for example 'lightnet acc1' and next paste the 'sk' value
-   you can repeat the process for multiple accounts

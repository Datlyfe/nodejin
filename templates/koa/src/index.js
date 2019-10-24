import Koa from "koa";
import cors from "@koa/cors";
import bp from "koa-bodyparser";

const app = new Koa();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bp());

app.use(async ctx => {
  ctx.body = { message: "Ready" };
});

app.listen(port, () => {
  console.log(`Server ready, Listenning on port ${port}`);
});

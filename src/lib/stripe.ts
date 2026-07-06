import Stripe from "stripe";
import config from "../config";

const stripe = new Stripe(config.stripe.secretKey as string);

export default stripe;

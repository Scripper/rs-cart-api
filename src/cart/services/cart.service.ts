import { Injectable } from '@nestjs/common';
import { Client, ClientConfig } from 'pg';
import { Cart } from '../models';

const DEFAULT_USER_ID = "111111-1a1a1-1a1a1-1111-211a1a11aa1a";

const {  DATABASE_HOST, DATABASE_PORT, DATABASE_USERNAME, DATABASE_NAME, DATABASE_PASSWORD } = process.env;
const options: ClientConfig = {
  host: DATABASE_HOST,
  port: +DATABASE_PORT,
  database: DATABASE_NAME,
  user: DATABASE_USERNAME,
  password: DATABASE_PASSWORD,
  connectionTimeoutMillis: 15000,
};

export enum CartStatuses {
  OPEN = 'OPEN',
  ORDERED = "ORDERED",
}

@Injectable()
export class CartService {

  async findByUserId(userId: string): Promise<Cart> {
    const id = userId || DEFAULT_USER_ID;
    const client = new Client(options);

    try{
      await client.connect();

      const queryCartsText = `select * from carts where user_id = '${id}'`;
      const result = await client.query(queryCartsText);

      if (result.rows.length === 0) {
        return null
      }

      const cart = result.rows[0];

      const queryItemsText = `select * from cart_items where cart_id = '${cart.id}'`;
      const items = (await client.query(queryItemsText)).rows;

      cart.items = items.map((item) => {
        item.product = {
          id: item.product_id
        }
        return item;
      });

      return cart;

    } catch(e) {
      console.log("Error => ",e);
    } finally {
      await client.end();
    }
  }

  async createByUserId(userId: string): Promise<Cart> {
    const id = userId || DEFAULT_USER_ID;
    const now = new Date().toJSON();

    const columns = "user_id, created_at, updated_at, status";
    const values = `'${id}', '${now}', '${now}', '${CartStatuses.OPEN}'`;
    const queryText = `INSERT INTO carts(${columns}) VALUES(${values}) RETURNING *`;

    const client = new Client(options);

    try {
      await client.connect();
      const result = await client.query(queryText);
      if (result?.rows ){
        return result?.rows[0] as Cart;
      }
      return result as Cart;
    } catch(e) {
      console.log(e);
    } finally {
      await client.end();
    }
  }

  async findOrCreateByUserId(userId: string): Promise<Cart> {
    const userCart = await this.findByUserId(userId || DEFAULT_USER_ID);

    if (userCart) {
      return userCart;
    }
    return await this.createByUserId(userId);
  }

  async updateByUserId(userId: string, req): Promise<Cart> {
    const { items } = JSON.parse(req.toString());
    const client = new Client(options);
    await client.connect();

    const { id, ...rest } = await this.findOrCreateByUserId(userId);

    const updatedCart = {
      id,
      ...rest,
      items: [ ...items, ...rest.items ],
    }

    try {
      await Promise.all(items.map((item) => {
        const values = `'${id}', '${item.count}', '${item.product.id}'`;
        const queryText = `insert into cart_items (cart_id, count, product_id) values(${values})`;
        return client.query(queryText);
      }));

      return { ...updatedCart };
    } catch(e) {
      console.log(e);
    } finally {
      await client.end();
    }
  }

  async removeByUserId(): Promise<void> {
    const client = new Client(options);

    try {
      await client.connect();
      const { id } = await this.findOrCreateByUserId(DEFAULT_USER_ID);
      const queryText = `DELETE FROM cart_items WHERE cart_id = '${id}'`
      await client.query(queryText);
    } catch(e) {
      console.log(e);
    } finally {
      await client.end();
    }
  }

}
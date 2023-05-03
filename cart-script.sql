CREATE TYPE card_status AS ENUM ('OPEN', 'ORDERED');
create extension if not exists "uuid-ossp"

create table carts (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid NOT NULL,
    created_at DATE NOT NULL,
    updated_at DATE NOT NULL,
    status card_status
)

create table cart_items (
    product_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    cart_id uuid,
    count int,
    foreign key ("cart_id") references "carts" ("id")
)

insert into carts (user_id, created_at, updated_at, status) values ('4182a120-f372-41fb-bee4-21daa9f4051e', '2023-01-01', '2023-01-01', 'OPEN');
insert into carts (user_id, created_at, updated_at, status) values ('4182a120-f372-41fb-bee4-21daa9f4052e', '2023-01-02', '2023-01-02', 'OPEN');
insert into carts (user_id, created_at, updated_at, status) values ('4182a120-f372-41fb-bee4-21daa9f4051e', '2023-01-01', '2023-01-01', 'ORDERED');

insert into cart_items (cart_id, "count") values ('a6b8ae56-d591-4137-af36-2e50f008d614', 1);
insert into cart_items (cart_id, "count") values ('942d524b-d6ad-4b19-9411-151e66f19632', 2);
insert into cart_items (cart_id, "count") values ('74bb56fb-0089-4da7-8bfb-ecede7b71225', 3);
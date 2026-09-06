# Sahabat UMKM

SAHABAT UMKM — LOCAL STORAGE MOBILE APP

Build a complete, production-ready mobile application named Sahabat UMKM.

Tagline:

Stok rapi, jualan lancar.

This must be a fully functional offline mobile business management application for Indonesian UMKM.

The application must NOT use any backend.

The application must NOT require an account.

The application must NOT require internet access.

All user data must be stored locally on the user's device.

ABSOLUTE ARCHITECTURE REQUIREMENT

Use only:

React

TypeScript

Vite

Tailwind CSS

shadcn/ui when useful

Browser LocalStorage

IndexedDB

Dexie.js

Capacitor-compatible code

The application must be completely client-side.

There must be:

NO BACKEND

NO DATABASE SERVER

NO SUPABASE

NO FIREBASE

NO POSTGRESQL

NO MYSQL

NO API

NO REST API

NO GraphQL

NO AUTHENTICATION

NO LOGIN

NO REGISTRATION

NO CLOUD DATABASE

NO AI API

NO PAYMENT GATEWAY

NO EXTERNAL SERVICE REQUIRED FOR CORE FEATURES

Do not create server-side code.

Do not create server routes.

Do not create API endpoints.

Do not require environment variables for the core application.

DATA STORAGE

The application must use the phone's local storage.

Use:

LocalStorage

Use browser LocalStorage only for small preference/configuration data such as:

first launch status

selected theme

simple application preferences

UI preferences

Do NOT store large business datasets in LocalStorage.

IndexedDB

Use IndexedDB through Dexie.js for all important business data.

Store:

Products

Raw materials

Recipes

Recipe items

Sales

Sale items

Purchases

Purchase items

Stock movements

Expenses

Business settings

Other persistent business data

IndexedDB is the primary database.

IMPORTANT DATA PERSISTENCE RULE

Do NOT use React state, JavaScript variables, or in-memory arrays as the permanent database.

React state may only be used for temporary UI state.

Every important user action must be persisted to IndexedDB.

For example:

When the user creates a product:

UI
→ Dexie
→ IndexedDB

When the user closes and reopens the application:

IndexedDB
→ Dexie
→ UI

The data must remain available.

ANDROID STORAGE

The application will eventually be packaged using:

React
→ Vite
→ Capacitor
→ Android Studio
→ APK/AAB

When running as an Android application, the local IndexedDB/LocalStorage data must remain inside the application's local storage.

Do not require a remote server.

Do not require an internet connection.

Do not synchronize data with the cloud.

The application should behave like a standalone offline Android application.

DATA OWNERSHIP

The user's business data belongs entirely to the device.

There is no user account.

There is no cloud account.

There is no remote database.

If the user deletes the application or clears its application data, the locally stored business data may be lost.

Therefore provide a proper:

Ekspor Data

feature so users can create backups.

APPLICATION LANGUAGE

Use Bahasa Indonesia throughout the application.

Currency:

Rupiah (IDR)

Examples:

Rp 5.000
Rp 25.000
Rp 125.000
Rp 1.500.000

Use Indonesian number formatting.

Dates should use Indonesian formatting.

MAIN NAVIGATION

Create five mobile navigation sections:

Beranda

Stok

Penjualan

Laporan

Lainnya

"Lainnya" contains:

Produk

Bahan Baku

Pembelian

Pengeluaran

Pengaturan

Use a bottom navigation bar optimized for Android phones.

BERANDA

Show:

Penjualan Hari Ini

Rp 0

Transaksi Hari Ini

0 transaksi

Perkiraan Laba Hari Ini

Rp 0

Stok Menipis

Show products and raw materials below their minimum stock.

Statuses:

Aman

Menipis

Habis

Also show:

Penjualan 7 Hari Terakhir

Use only a lightweight CSS/SVG visualization or simple list.

Do NOT install a heavy chart library.

Produk Terlaris

Show actual products based on stored sales.

All values must come from IndexedDB.

PRODUK

Create complete CRUD.

Fields:

id

nama

SKU

harga jual

HPP

stok

satuan

minimum stok

foto optional

createdAt

updatedAt

Allow:

tambah

edit

hapus

cari

detail

Persist everything to IndexedDB.

BAHAN BAKU

Create complete CRUD.

Fields:

id

nama

satuan

stok

minimum stok

harga beli terakhir

createdAt

updatedAt

Units:

pcs

gram

kg

ml

liter

meter

box

botol

sachet

lainnya

Allow custom units.

Persist everything to IndexedDB.

RESEP

Products can optionally have recipes.

Example:

Es Teh Manis:

Teh = 5 gram
Gula = 20 gram
Cup = 1 pcs

Create a simple recipe editor.

Automatically calculate HPP from recipe.

Formula:

quantity × ingredient cost

Sum all ingredients.

Display:

HPP berdasarkan resep

Persist recipes to IndexedDB.

AUTOMATIC STOCK

When a product is sold:

Reduce product stock.

If the product has a recipe, reduce the corresponding raw materials.

Create stock movement records.

Calculate estimated profit.

Example:

10 Es Teh Manis sold.

Automatically reduce:

Teh -50 gram
Gula -200 gram
Cup -10 pcs

Check stock BEFORE completing the sale.

If stock is insufficient:

Show:

Stok bahan baku tidak mencukupi.

Show the affected material.

Do not create a partial transaction.

PENJUALAN

Create a simple POS interface.

Show products.

Tap a product to add it to cart.

Cart:

product

quantity

price

subtotal

Allow quantity changes and item removal.

Show:

Subtotal
Diskon
Total

Payment methods:

Tunai

Transfer

QRIS

Lainnya

Button:

Selesaikan Transaksi

All transaction data must be stored locally.

No server request should occur.

ATOMIC SALES

Use Dexie transactions.

A sale must atomically perform:

Validate stock.

Create sale.

Create sale items.

Reduce product stock.

Reduce recipe raw materials.

Create stock movements.

If any operation fails:

Rollback the entire transaction.

Never leave partially updated data.

RIWAYAT PENJUALAN

Show local transaction history.

Example:

INV-20260904-001

Display:

invoice

date

items

quantity

subtotal

discount

total

payment method

estimated HPP

estimated profit

All information must come from IndexedDB.

PEMBELIAN

Allow users to record raw material purchases.

Fields:

supplier

date

raw material

quantity

unit price

When saved:

increase raw material stock

update latest purchase price

create stock movement

save purchase

Use a Dexie transaction.

STOK

Create:

Stok Produk

and

Stok Bahan Baku

Display:

Nama
Jumlah
Satuan
Status

Allow:

Penyesuaian Stok

Options:

Tambah Stok
Kurangi Stok

Require a reason.

Examples:

Stok opname

Barang rusak

Barang hilang

Salah input

Lainnya

Every adjustment must create a stock movement.

MUTASI STOK

Show:

Date
Item
Quantity
Type
Reason

Examples:

+20 kg
Pembelian

-2 kg
Penjualan

-1 kg
Barang rusak

Newest first.

PENGELUARAN

Create local expense management.

Categories:

Listrik

Air

Sewa

Gaji

Transportasi

Bahan bakar

Peralatan

Marketing

Lainnya

Fields:

kategori

keterangan

jumlah

tanggal

Persist to IndexedDB.

LAPORAN

Create reports based entirely on local data.

Penjualan

Show:

total

transaction count

average transaction

Filters:

Hari ini

7 hari

Bulan ini

Custom

Produk Terlaris

Sort by quantity sold.

HPP

Show estimated COGS.

Laba Kotor

Penjualan - HPP

Pengeluaran

Show expense totals.

Perkiraan Laba Bersih

Penjualan - HPP - Pengeluaran

Clearly label it:

Perkiraan laba bersih

This is not formal accounting.

BACKUP

Because there is no cloud database, backup is extremely important.

Create:

Pengaturan → Data

Button:

Ekspor Data

Export all IndexedDB data into a JSON file.

The JSON must contain:

products

rawMaterials

recipes

recipeItems

sales

saleItems

purchases

purchaseItems

stockMovements

expenses

settings

Create:

Impor Data

Allow the user to select a previously exported JSON backup.

Validate the JSON before importing.

Show confirmation before modifying existing data.

Do not silently delete existing data.

DELETE ALL DATA

Provide:

Hapus Semua Data

This must be extremely clear and dangerous.

Require the user to type:

HAPUS

before deleting all business data.

Delete:

IndexedDB records

relevant LocalStorage settings

After deletion, return the app to the first-launch state.

FIRST LAUNCH

Show:

Selamat datang di Sahabat UMKM

"Kelola stok, penjualan, dan usaha Anda dengan lebih mudah."

Ask:

Nama Usaha

Optional:

Nama Pemilik

Options:

Mulai dengan Data Contoh

Mulai dari Kosong

Never require login.

Never require internet.

DEMO DATA

If the user chooses demo data, create local demo data.

Products:

Es Teh Manis

Kopi Susu

Mie Goreng

Nasi Goreng

Es Jeruk

Raw materials:

Teh

Gula

Kopi

Susu

Cup

Mie

Telur

Beras

Jeruk

Minyak

Create recipes.

Create example sales.

Create example purchases.

Create expenses.

Everything must be inserted into IndexedDB locally.

SEARCH

Implement local search.

Products:

Search name/SKU.

Raw materials:

Search name.

Sales:

Search invoice.

No network request.

UI

Create a polished Android-first interface.

The design should feel:

simple

friendly

modern

trustworthy

practical

Use:

rounded cards

clear typography

large numbers

simple icons

large touch targets

bottom navigation

simple forms

Avoid:

excessive animation

glassmorphism

complex charts

large tables

tiny text

unnecessary visual effects

OFFLINE

The core application must work with:

Wi-Fi OFF

and

Mobile Data OFF

The user must still be able to:

view products

view stock

record sales

record purchases

adjust stock

record expenses

view reports

export data

import data

Do not show a blocking "No Internet" screen.

PERFORMANCE

Keep the application lightweight.

Do not install dependencies without a clear reason.

Do not use a heavy state management library.

Do not use a heavy chart library.

Do not render thousands of records simultaneously.

Use simple pagination or list limits if necessary.

ANDROID KEYBOARD

The application will run inside Android WebView.

Do not add global keydown/keyup listeners.

Do not override Android keyboard behavior.

Do not aggressively call preventDefault.

Inputs must work naturally.

When the keyboard opens, the focused input must remain visible.

ANDROID BACK BUTTON

Use normal client-side routing.

Do not aggressively override Android back navigation.

The back button should return to the previous screen where appropriate.

ROUTING

Use lightweight client-side routing.

Routes:

/
/stok
/stok/produk
/stok/bahan-baku
/stok/mutasi
/penjualan
/penjualan/riwayat
/pembelian
/pengeluaran
/laporan
/produk
/produk/:id
/pengaturan

No server-side routing.

DATABASE STRUCTURE

Use Dexie.js.

Create:

src/lib/db.ts

Tables:

products
rawMaterials
recipes
recipeItems
sales
saleItems
purchases
purchaseItems
stockMovements
expenses
settings

Use TypeScript interfaces.

Use reliable unique IDs.

Never use array indexes as database IDs.

CALCULATIONS

Create centralized calculation functions:

formatCurrency()
calculateRecipeCost()
calculateSaleSubtotal()
calculateSaleTotal()
calculateCOGS()
calculateGrossProfit()
calculateNetProfit()
calculateStockStatus()

Use integer Rupiah values to avoid floating-point money errors.

DATA INTEGRITY

Never allow a failed operation to partially modify inventory.

Sales and purchases must use IndexedDB transactions.

Stock changes must always create a corresponding stock movement.

Do not silently modify stock.

PROJECT STRUCTURE

Use a simple structure:

src/
components/
features/
hooks/
lib/
db.ts
calculations.ts
currency.ts
date.ts
backup.ts
pages/
types/
App.tsx
main.tsx

Keep the project maintainable.

Do not over-engineer.

SECURITY

There are no backend credentials.

Do not create API keys.

Do not create secrets.

Do not expose unnecessary data externally.

All business data remains local.

Do not send analytics or business data to third-party services.

BUILD

The project must successfully run:

npm run build

Production files must be generated into:

dist/

Fix all TypeScript errors.

Fix all build errors.

Do not leave broken imports.

Do not leave fake functionality.

Do not leave placeholder buttons.

CAPACITOR COMPATIBILITY

The project must be compatible with:

Capacitor + Android Studio

The intended packaging flow is:

npm run build

then Capacitor can be configured to use the generated:

dist/

The application must work when loaded inside Android WebView.

Do not depend on a website domain.

Do not depend on a backend.

Do not depend on an internet connection.

FINAL REQUIREMENT

Build the entire application as a real functional offline Android-ready application.

The final application must:

store business data locally

use IndexedDB/Dexie for persistent business data

use LocalStorage for small preferences

contain no backend

contain no cloud database

require no account

require no login

require no internet

work offline

manage products

manage raw materials

manage recipes

calculate HPP

manage stock

automatically reduce stock after sales

record purchases

record sales

record expenses

calculate estimated profit

provide reports

provide stock history

provide data backup

provide data restore

provide data deletion

provide demo data

be optimized for Android WebView

be ready for Capacitor

successfully build with Vite

Do not add backend infrastructure.

Do not add authentication.

Do not add cloud synchronization.

Do not add unnecessary services.

When there is a choice between a complex architecture and a simple local implementation, ALWAYS choose the simple local implementation.

The application is:

Sahabat UMKM

Stok rapi, jualan lancar.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://stok-lancar-app.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/a43da735-a9b7-4cf6-abed-021283abea0e).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

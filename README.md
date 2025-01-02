# Aplikasi Cardano Web3Tx

## Introduction

Projek: **MiniHackathon Cardano 2024 Universitas Kristen Maranatha**
Owner: **Rico Dharmawan** / **Logica**

Aplikasi sudah mencegah terajadinya bypass saat login dan sudah dilengkapi fitur untuk melakukan transaksi di mana merchant belum bisa menarik uang sampai pembeli mengkonfirmasi bahwa barangnya sudah sampai, namun pembeli pun tidak bisa mengkonfirmasi secara sembarangan maka dibuatlah token yang akan mereka dapat secara fisik bersama barang yang mereka pesan. Pembeli juga akan diberi waktu beberapa hari untuk memasukkan token tersebut setelah kurir memberi konfirmasi kepada server bahwa barang sudah diterima(Sistem konfirmasi barang sampai ke tujuan seperti tokopedia). Jika pembeli tidak mengkonfirmasi, merchant hanya bisa mencairkan setelah satu bulan.

Aplikasi ini tidak hanya menggunakan file environment .env tetapi juga menggunakan file .json sebagai database sample untuk menyimpan data transaksi yang nanti bisa digantikan dengan database asli. Environment backend juga digunakan untuk projek aplikasi ini.

## Key Features

- Menggabungkan kedua challenge minihackathon:
> Challenge 1: Mencegah bypass login

> Challenge 2: Mencegah merchant untuk mencairkan uang sebelum pembeli menerima barang

- Bisa menggunakan database asli untuk daftar item dan menyimpan data

## Menjalankan Aplikasi

Untuk menjalankan aplikasi, dibutuhkan untuk menjalankan server localhost untuk aplikasi frontend dan backend. Gunakan dua terminal untuk menjalankan kedua server.

**Aplikasi Frontend**
```bash
npm run dev
```

atau

```bash
npm run start
```
**Aplikasi Backend**

```bash
npm run server
```

Build projek

```bash
npm run build
```
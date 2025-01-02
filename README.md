# Aplikasi Cardano Web3Tx

Projek ini adalah projek MiniHackathon Cardano 2024, milik partisipan atas nama **Rico Dharmawan** atau kelompok **Logica**. Aplikasi sudah mencegah terajadinya bypass saat login dan sudah dilengkapi fitur untuk melakukan transaksi di mana merchant belum bisa menarik uang sampai client mengkonfirmasi bahwa barangnya sudah sampai, namun client pun tidak bisa mengkonfirmasi secara sembarangan maka dibuatlah token yang akan mereka dapat secara fisik bersama barang yang mereka pesan. Client juga akan diberi waktu beberapa hari untuk memasukkan token tersebut setelah kurir memberi konfirmasi kepada server bahwa barang sudah diterima(Sistem konfirmasi barang sampai ke tujuan seperti tokopedia).

Aplikasi ini tidak hanya menggunakan file environment .env tetapi juga menggunakan file .json sebagai database sample untuk menyimpan data transaksi yang nanti bisa digantikan dengan database asli. Environment backend juga digunakan untuk projek aplikasi ini.

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
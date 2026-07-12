1. Buat Folder Utama dan Sub-foldernya

Perintah mkdir -p akan membuat folder beserta seluruh jalurnya sekaligus. Jalankan perintah ini (Salin dan paste):
```
sudo mkdir -p /mnt/nas/share/bot_pelanggan/foto_ktp
sudo mkdir -p /mnt/nas/share/bot_pelanggan/foto_rumah
sudo mkdir -p /mnt/nas/share/bot_pelanggan/data_excel
sudo mkdir -p /mnt/nas/share/bot_pelanggan/data_pdf
```
2. Berikan Hak Akses Penuh (Read & Write)

Karena bot ini berjalan di dalam Docker (yang terkadang menggunakan user internal khusus), kita perlu memastikan Docker diizinkan untuk menulis, membuat, dan mengedit file Excel di folder tersebut.

Jalankan perintah ini agar folder NAS memiliki akses baca-tulis:
```
sudo chmod -R 777 /mnt/nas/share/bot_pelanggan
```
(Perintah -R artinya rekursif, menerapkan hak akses ke semua sub-folder di dalamnya).

3. Pindahkan atau copy file template-import-pelanggan.xlsx dari komputer Anda ke server Ubuntu, tepatnya ke dalam direktori:
/mnt/nas/share/bot_pelanggan/

4. Scan QR Code untuk Bot utama :
```
sudo docker logs -f psb_baileys_bot
```
5. Scan QR Code untuk Bot Notif pelanggan :
```
sudo docker logs -f psb_baileys_pelanggan
```
6. Ubah ALLOWED_USERS di .ENV dengan nomerhp 628xxxxxxxxxx dan Nomer LID Whatsapp lihat di LOGS

Dibuat oleh ZYLVEmedia

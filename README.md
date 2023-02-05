# api-face-detection
<p>Project ini menggunakan Amazon Rekognition untuk mendeteksi wajah dalam gambar. API ini dibangun dengan Node.js dan menggunakan AWS SDK untuk berkomunikasi dengan Rekognition.</p>

<h2><b>Instalasi</b></h2>
<ol>
  <li>Clone repository ini ke komputer Anda.</li>
  <li>Instal semua dependensi yang dibutuhkan dengan perintah npm install.</li>
  <li>Buat akun AWS dan aktifkan layanan Rekognition.</li>
  <li>Buat credential IAM dengan akses ke Rekognition.</li>
  <li>Simpan credential Anda dalam file ~/.aws/credentials atau menentukan melalui environment variable.</li>
  <li>Jalankan server dengan perintah npm start.</li>
</ol>

<h2><b>Penggunaan</b></h2>
<p>API ini memiliki satu endpoint, yaitu /detect. Endpoint ini menerima sebuah gambar dan mengembalikan response wajah yang terdeteksi dalam gambar tersebut.

Untuk menggunakan endpoint ini, kirimkan permintaan POST dengan header Content-Type: image/jpeg dan bodi berisi gambar JPEG ke alamat http://localhost:3000/detect. Anda akan menerima respons berisi teks yang terdeteksi dalam gambar.

Contoh menggunakan curl:</p>
<p>curl -X POST http://localhost:3000/detect -H "Content-Type: image/jpeg" --data-binary @path/to/image.jpeg</p>
  
<h2><b>Kontribusi</b></h2>
<p>Project ini terbuka untuk kontribusi dari siapa saja. Jika Anda ingin berkontribusi, silakan buka issue atau buat pull request.</p>

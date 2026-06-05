-- 1. BERSIHKAN DATA LAMA & RESET PENGHITUNG ID (PENTING)
TRUNCATE TABLE "jawabanPGs", "jawabanEsais", "opsis", "soals", "attempts", "levels", "sections", "pelajars", "admins" RESTART IDENTITY CASCADE;

-- 2. INSERT ADMIN & PELAJAR (Tanpa ID, database akan generate otomatis)
INSERT INTO admins (nama, username, password) VALUES 
('Super Admin', 'admin', '$2y$10$dummyhashedpassword');

INSERT INTO pelajars (nama, username, password) VALUES 
('Rakan Student', 'rakan', '$2y$10$dummyhashedpassword');

-- 3. INSERT SECTIONS (Kolom ID dihapus)
INSERT INTO sections (nama, slug) VALUES
('Logika Dasar', 'logika-dasar'),
('Logika Pemrograman', 'logika-pemrograman'),
('Logika Silogisme', 'logika-silogisme');

-- 4. INSERT LEVELS (Kolom ID dihapus, urutan data dijaga agar ID tetap 1-30)
INSERT INTO levels (id_section, nama) VALUES
-- Section 1: Logika Dasar
(1, 'Level 1: Pengenalan Logika'),
(1, 'Level 2: Pernyataan & Kalimat'),
(1, 'Level 3: Negasi (Ingkaran)'),
(1, 'Level 4: Konjungsi & Disjungsi'),
(1, 'Level 5: Implikasi Dasar'),
(1, 'Level 6: Biimplikasi'),
(1, 'Level 7: Tautologi & Kontradiksi'),
(1, 'Level 8: Ekuivalensi Logis'),
(1, 'Level 9: Kuantor Universal'),
(1, 'Level 10: Kuantor Eksistensial'),
-- Section 2: Logika Pemrograman
(2, 'Level 1: Variabel & Tipe Data'),
(2, 'Level 2: Operator Aritmatika'),
(2, 'Level 3: Operator Perbandingan'),
(2, 'Level 4: Logika Boolean (AND/OR/NOT)'),
(2, 'Level 5: Percabangan (If-Else)'),
(2, 'Level 6: Percabangan Bertingkat'),
(2, 'Level 7: Perulangan (For Loop)'),
(2, 'Level 8: Perulangan (While Loop)'),
(2, 'Level 9: Array & Indexing'),
(2, 'Level 10: Algoritma Sederhana'),
-- Section 3: Logika Silogisme
(3, 'Level 1: Modus Ponens'),
(3, 'Level 2: Modus Tollens'),
(3, 'Level 3: Silogisme Hipotetis'),
(3, 'Level 4: Silogisme Kategoris A'),
(3, 'Level 5: Silogisme Kategoris B'),
(3, 'Level 6: Fallacy (Kesesatan Berpikir)'),
(3, 'Level 7: Diagram Venn Dasar'),
(3, 'Level 8: Penarikan Kesimpulan I'),
(3, 'Level 9: Penarikan Kesimpulan II'),
(3, 'Level 10: Logika Kompleks');

-- 5. INSERT SOALS 
-- (Kolom ID dihapus. Database akan generate ID 1-180 secara berurutan sesuai baris ini)
INSERT INTO soals (id_level, tipe, text_soal, kata_kunci) VALUES
-- === SECTION 1: LOGIKA DASAR ===
-- Level 1
(1, 'pg', 'Manakah di bawah ini yang merupakan sebuah proposisi (kalimat pernyataan)?', null),
(1, 'pg', 'Ilmu yang mempelajari prinsip-prinsip penalaran yang benar disebut...', null),
(1, 'pg', 'Kalimat "Tolong tutup pintu itu!" termasuk jenis kalimat...', null),
(1, 'pg', 'Nilai kebenaran dari pernyataan "Jakarta adalah ibukota Indonesia" adalah...', null),
(1, 'pg', 'Logika berasal dari kata Yunani "Logos" yang berarti...', null),
(1, 'esai', 'Jelaskan mengapa kalimat perintah tidak memiliki nilai kebenaran dalam logika matematika!', 'bukan pernyataan, tidak bisa dinilai benar salah'),

-- Level 2
(2, 'pg', 'Manakah pernyataan berikut yang bernilai SALAH?', null),
(2, 'pg', 'Jika p bernilai Benar dan q bernilai Salah, maka...', null),
(2, 'pg', 'Simbol umum untuk merepresentasikan proposisi adalah...', null),
(2, 'pg', 'Lawan dari pernyataan benar adalah...', null),
(2, 'pg', 'Pernyataan majemuk dibentuk menggunakan...', null),
(2, 'esai', 'Berikan satu contoh kalimat terbuka dan jelaskan alasannya!', 'memuat variabel, belum diketahui nilai kebenarannya'),

-- Level 3 (Negasi)
(3, 'pg', 'Negasi dari pernyataan "Semua siswa lulus ujian" adalah...', null),
(3, 'pg', 'Jika p = "Hari ini hujan", maka ~p adalah...', null),
(3, 'pg', 'Simbol logika untuk negasi adalah...', null),
(3, 'pg', 'Negasi dari "2 + 2 = 5" adalah...', null),
(3, 'pg', 'Ingkaran dari pernyataan "Budi rajin dan pandai" adalah...', null),
(3, 'esai', 'Tuliskan negasi dari pernyataan: "Jika harga naik, maka permintaan turun".', 'harga naik dan permintaan tidak turun'),

-- Level 4 (Konjungsi/Disjungsi)
(4, 'pg', 'Pernyataan "p DAN q" bernilai benar jika...', null),
(4, 'pg', 'Simbol "v" dalam logika matematika melambangkan...', null),
(4, 'pg', 'Pernyataan "p ATAU q" bernilai salah hanya jika...', null),
(4, 'pg', 'Kambing makan rumput DAN Sapi makan daging. Nilai kebenarannya adalah...', null),
(4, 'pg', 'Operasi logika yang sesuai dengan kata hubung "ATAU" adalah...', null),
(4, 'esai', 'Jelaskan perbedaan mendasar antara Konjungsi dan Disjungsi dalam penentuan nilai kebenaran!', 'konjungsi butuh keduanya benar, disjungsi cukup satu benar'),

-- Level 5 s/d 10
(5, 'pg', 'Implikasi "Jika p maka q" bernilai SALAH jika...', null),
(5, 'pg', 'Dalam implikasi p -> q, p disebut sebagai...', null),
(5, 'pg', 'Dalam implikasi p -> q, q disebut sebagai...', null),
(5, 'pg', 'Jika 1+1=2 maka Jakarta ada di Jawa. Nilai kebenarannya...', null),
(5, 'pg', 'Cara membaca simbol p -> q adalah...', null),
(5, 'esai', 'Buatlah tabel kebenaran singkat untuk implikasi!', 'B S -> S'),

(6, 'pg', 'Biimplikasi bernilai benar jika...', null),
(6, 'pg', 'Simbol biimplikasi adalah...', null),
(6, 'pg', 'Pernyataan "p jika dan hanya jika q" disebut...', null),
(6, 'pg', 'Syarat agar p <-> q bernilai salah adalah...', null),
(6, 'pg', 'Manakah contoh biimplikasi yang benar?', null),
(6, 'esai', 'Apa hubungan biimplikasi dengan implikasi timbal balik?', 'p->q dan q->p'),

(7, 'pg', 'Pernyataan yang selalu bernilai BENAR untuk semua kemungkinan disebut...', null),
(7, 'pg', 'Pernyataan yang selalu bernilai SALAH disebut...', null),
(7, 'pg', '(p v ~p) adalah contoh dari...', null),
(7, 'pg', '(p ^ ~p) adalah contoh dari...', null),
(7, 'pg', 'Kontingensi adalah...', null),
(7, 'esai', 'Buktikan bahwa (p v ~p) adalah tautologi!', 'selalu benar'),

(8, 'pg', 'Dua pernyataan disebut ekuivalen logis jika...', null),
(8, 'pg', 'Hukum De Morgan untuk ~(p ^ q) adalah...', null),
(8, 'pg', 'p -> q ekuivalen dengan...', null),
(8, 'pg', 'Negasi ganda ~(~p) ekuivalen dengan...', null),
(8, 'pg', 'Simbol ekuivalensi adalah...', null),
(8, 'esai', 'Ubah bentuk p -> q menjadi bentuk Disjungsi yang ekuivalen!', '~p v q'),

(9, 'pg', 'Kuantor universal ditandai dengan kata...', null),
(9, 'pg', 'Simbol kuantor universal adalah...', null),
(9, 'pg', 'Arti simbol "A terbalik" (∀) adalah...', null),
(9, 'pg', 'Negasi dari "Semua orang senang" adalah...', null),
(9, 'pg', 'Manakah kalimat berkuantor universal?', null),
(9, 'esai', 'Berikan contoh penyangkal (counter-example) untuk pernyataan: Semua bilangan prima adalah ganjil.', 'bilangan 2'),

(10, 'pg', 'Kuantor eksistensial ditandai dengan kata...', null),
(10, 'pg', 'Simbol kuantor eksistensial (∃) dibaca...', null),
(10, 'pg', 'Negasi dari "Ada siswa yang bolos" adalah...', null),
(10, 'pg', 'Pernyataan "Beberapa x adalah y" bernilai benar jika...', null),
(10, 'pg', 'Hubungan antara ∀ dan ∃ dalam negasi adalah...', null),
(10, 'esai', 'Jelaskan perbedaan makna "Semua" dan "Beberapa" dalam logika!', 'universal vs sebagian'),

-- === SECTION 2: LOGIKA PEMROGRAMAN ===
-- Level 11 (Var & Tipe Data)
(11, 'pg', 'Wadah untuk menyimpan nilai data di memori disebut...', null),
(11, 'pg', 'Tipe data untuk menyimpan angka bulat adalah...', null),
(11, 'pg', 'Tipe data "String" digunakan untuk menyimpan...', null),
(11, 'pg', 'Manakah penulisan variabel yang valid dalam CamelCase?', null),
(11, 'pg', 'Nilai default boolean biasanya adalah...', null),
(11, 'esai', 'Apa perbedaan antara Integer dan Float?', 'bulat vs desimal'),

-- Level 12 (Aritmatika)
(12, 'pg', 'Hasil dari operasi 10 % 3 (Modulus) adalah...', null),
(12, 'pg', 'Operator "*" digunakan untuk...', null),
(12, 'pg', 'Jika a=5, maka a++ akan menghasilkan nilai akhir...', null),
(12, 'pg', 'Urutan prioritas operasi matematika yang benar adalah...', null),
(12, 'pg', 'Hasil dari 2 + 3 * 4 adalah...', null),
(12, 'esai', 'Jelaskan fungsi operator Modulus (%) dalam pemrograman!', 'sisa bagi'),

-- Level 13 (Perbandingan)
(13, 'pg', 'Operator "==" digunakan untuk mengecek...', null),
(13, 'pg', 'Hasil dari (5 > 8) adalah...', null),
(13, 'pg', 'Operator "!=" memiliki arti...', null),
(13, 'pg', 'Jika A=10 dan B=10, maka A >= B bernilai...', null),
(13, 'pg', 'Manakah operator untuk "kurang dari atau sama dengan"?', null),
(13, 'esai', 'Apa perbedaan antara "=" dan "==" dalam coding?', 'assignment vs comparison'),

-- Level 14 (Boolean Logic)
(14, 'pg', 'Operasi (TRUE && FALSE) menghasilkan...', null),
(14, 'pg', 'Operasi (TRUE || FALSE) menghasilkan...', null),
(14, 'pg', 'Operator logika NOT biasanya disimbolkan dengan...', null),
(14, 'pg', 'Jika A=True, B=False. Maka (!A || B) adalah...', null),
(14, 'pg', 'Gerbang logika yang membalikkan nilai input adalah...', null),
(14, 'esai', 'Jelaskan konsep Short-Circuit Evaluation pada operator OR (||)!', 'jika kiri true kanan diabaikan'),

-- Level 15 (Percabangan)
(15, 'pg', 'Struktur kontrol untuk menjalankan kode berdasarkan kondisi tertentu adalah...', null),
(15, 'pg', 'Bagian "else" akan dijalankan jika...', null),
(15, 'pg', 'Keyword "if" digunakan untuk...', null),
(15, 'pg', 'Struktur "Switch-Case" mirip fungsinya dengan...', null),
(15, 'pg', 'Kondisi di dalam "if (...)" harus menghasilkan nilai bertipe...', null),
(15, 'esai', 'Buat pseudocode sederhana untuk mengecek bilangan genap!', 'if n mod 2 == 0'),

(16, 'pg', 'Nested If adalah...', null),
(16, 'pg', 'Dalam "if - else if - else", jika kondisi pertama terpenuhi, maka...', null),
(16, 'pg', 'Kompleksitas kode akan meningkat jika terlalu banyak...', null),
(16, 'pg', 'Alternatif dari if-else bertingkat yang lebih rapi adalah...', null),
(16, 'pg', 'Logika "AND" sering digunakan dalam if untuk...', null),
(16, 'esai', 'Kapan sebaiknya menggunakan Switch Case dibanding If-Else?', 'cek nilai pasti banyak opsi'),

(17, 'pg', 'Perulangan yang jumlah iterasinya sudah diketahui biasanya menggunakan...', null),
(17, 'pg', 'i++ dalam for loop berfungsi sebagai...', null),
(17, 'pg', 'Kondisi terminasi dalam loop berfungsi untuk...', null),
(17, 'pg', 'Jika loop tidak pernah berhenti, disebut...', null),
(17, 'pg', 'Sintaks for(int i=0; i<5; i++) akan mengulang sebanyak...', null),
(17, 'esai', 'Apa komponen utama dalam struktur For Loop?', 'inisialisasi, kondisi, increment'),

(18, 'pg', 'While loop akan berjalan selama kondisi bernilai...', null),
(18, 'pg', 'Perbedaan Do-While dan While adalah...', null),
(18, 'pg', 'Kapan While loop lebih cocok digunakan dibanding For loop?', null),
(18, 'pg', 'Risiko utama penggunaan While loop adalah...', null),
(18, 'pg', 'Pada Do-While, minimal kode dijalankan sebanyak...', null),
(18, 'esai', 'Mengapa kita perlu mengubah variabel kondisi di dalam While loop?', 'mencegah infinite loop'),

(19, 'pg', 'Index array biasanya dimulai dari angka...', null),
(19, 'pg', 'Untuk mengakses elemen pertama array A, kita gunakan...', null),
(19, 'pg', 'Jika array A memiliki 5 elemen, index terakhirnya adalah...', null),
(19, 'pg', 'Array digunakan untuk menyimpan...', null),
(19, 'pg', 'Mengakses index di luar kapasitas array menyebabkan error...', null),
(19, 'esai', 'Bagaimana cara mengakses elemen array menggunakan looping?', 'gunakan variabel counter sebagai index'),

(20, 'pg', 'Langkah-langkah logis penyelesaian masalah disebut...', null),
(20, 'pg', 'Pseudocode adalah...', null),
(20, 'pg', 'Flowchart menggunakan simbol belah ketupat untuk...', null),
(20, 'pg', 'Input dan Output dalam algoritma adalah...', null),
(20, 'pg', 'Algoritma yang baik harus...', null),
(20, 'esai', 'Gambarkan logika algoritma tukar isi gelas A dan B!', 'gunakan gelas C bantuan'),

-- === SECTION 3: LOGIKA SILOGISME ===
(21, 'pg', 'Modus Ponens: Jika p->q benar, dan p benar, maka...', null),
(21, 'pg', 'Premis 1: Jika hujan, tanah basah. Premis 2: Hujan. Kesimpulan?', null),
(21, 'pg', 'Rumus Modus Ponens adalah...', null),
(21, 'pg', 'Validitas Modus Ponens bergantung pada...', null),
(21, 'pg', 'Jika A maka B. Ternyata A terjadi. Maka...', null),
(21, 'esai', 'Buat satu contoh penarikan kesimpulan Modus Ponens!', 'jika belajar pintar, saya belajar, saya pintar'),

(22, 'pg', 'Modus Tollens: Jika p->q benar, dan ~q benar, maka...', null),
(22, 'pg', 'P1: Jika lampu nyala, ada listrik. P2: Tidak ada listrik. Kesimpulan?', null),
(22, 'pg', 'Rumus Modus Tollens adalah...', null),
(22, 'pg', 'P1: Jika P maka Q. P2: Tidak P. Kesimpulan "Tidak Q" adalah...', null),
(22, 'pg', 'Ciri khas Modus Tollens adalah penggunaan...', null),
(22, 'esai', 'Jelaskan mengapa premis "Tidak P" tidak bisa menyimpulkan "Tidak Q" (Fallacy)!', 'denying the antecedent'),

(23, 'pg', 'Silogisme Hipotetis menghubungkan...', null),
(23, 'pg', 'P1: p->q, P2: q->r. Kesimpulan?', null),
(23, 'pg', 'Jika A->B dan B->C, maka A->C disebut sifat...', null),
(23, 'pg', 'P1: Jika rajin, lulus. P2: Jika lulus, bahagia. Kesimpulan?', null),
(23, 'pg', 'Penghubung rantai logika dalam silogisme adalah...', null),
(23, 'esai', 'Buat rantai logika 3 premis menggunakan silogisme hipotetis!', 'A->B, B->C, C->D, maka A->D'),

(24, 'pg', 'Semua manusia fana. Socrates manusia. Kesimpulan?', null),
(24, 'pg', 'Premis mayor dalam silogisme biasanya memuat kata...', null),
(24, 'pg', 'Term tengah (middle term) berfungsi untuk...', null),
(24, 'pg', 'Kesimpulan dari silogisme kategoris tidak boleh memuat...', null),
(24, 'pg', 'Pola silogisme AAA berarti...', null),
(24, 'esai', 'Apa yang dimaksud dengan Term Tengah?', 'penghubung dua premis'),

(25, 'pg', 'Semua burung bertelur. Kucing bukan burung. Kesimpulan?', null),
(25, 'pg', 'Jika salah satu premis negatif, kesimpulan harus...', null),
(25, 'pg', 'Jika kedua premis negatif, maka...', null),
(25, 'pg', 'Semua A adalah B. Beberapa C adalah A. Kesimpulan?', null),
(25, 'pg', 'Kata "Beberapa" dalam logika silogisme berarti...', null),
(25, 'esai', 'Jelaskan aturan premis partikular (sebagian) dalam kesimpulan!', 'kesimpulan harus partikular'),

(26, 'pg', 'Kesesatan berpikir disebut juga...', null),
(26, 'pg', 'Menyerang pribadi lawan bicara bukan argumennya disebut...', null),
(26, 'pg', 'Menganggap benar karena banyak yang percaya disebut...', null),
(26, 'pg', 'Strawman Fallacy adalah...', null),
(26, 'pg', 'Post Hoc Ergo Propter Hoc berkaitan dengan...', null),
(26, 'esai', 'Berikan contoh Ad Hominem!', 'kamu salah karena kamu jelek'),

(27, 'pg', 'Lingkaran dalam diagram venn merepresentasikan...', null),
(27, 'pg', 'Jika himpunan A ada di dalam himpunan B, artinya...', null),
(27, 'pg', 'Irisan dua lingkaran menggambarkan kata...', null),
(27, 'pg', 'Dua lingkaran terpisah total artinya...', null),
(27, 'pg', 'Diagram untuk "Sebagian A adalah B" adalah...', null),
(27, 'esai', 'Gambarkan deskripsi diagram venn untuk "Tidak ada A yang B"!', 'dua lingkaran terpisah'),

(28, 'pg', 'P1: Semua dokter pintar. P2: Budi pintar. Kesimpulan Budi dokter adalah...', null),
(28, 'pg', 'Kesimpulan sah adalah kesimpulan yang...', null),
(28, 'pg', 'Logika induktif bergerak dari...', null),
(28, 'pg', 'Logika deduktif bergerak dari...', null),
(28, 'pg', 'Generalisasi terburu-buru adalah contoh...', null),
(28, 'esai', 'Apa beda Deduktif dan Induktif?', 'umum ke khusus vs khusus ke umum'),

(29, 'pg', 'P1: Jika tidak makan, lapar. P2: Saya lapar. Kesimpulan saya tidak makan adalah...', null),
(29, 'pg', 'Menarik kesimpulan dari akibat ke sebab biasanya...', null),
(29, 'pg', 'Entimen adalah...', null),
(29, 'pg', 'Premis yang dihilangkan dalam percakapan disebut...', null),
(29, 'pg', 'Contoh entimen: Dia pasti sukses karena dia rajin. Premis yang hilang?', null),
(29, 'esai', 'Lengkapi silogisme dari entimen: "Ikan bernapas dengan insang, maka Paus bukan ikan".', 'paus tidak pakai insang'),

(30, 'pg', 'Dilema konstruktif menggunakan operator...', null),
(30, 'pg', 'P1: (p->q) ^ (r->s). P2: p v r. Kesimpulan?', null),
(30, 'pg', 'Reductio ad absurdum adalah teknik pembuktian dengan...', null),
(30, 'pg', 'Paradoks adalah pernyataan yang...', null),
(30, 'pg', 'Logika Fuzzy memungkinkan nilai kebenaran...', null),
(30, 'esai', 'Jelaskan konsep dasar pembuktian kontradiksi!', 'andaikan salah, cari pertentangan');

-- 6. INSERT OPSIS (4 OPSI PER SOAL PG, TOTAL 600 OPSI)
-- (Tidak ada kolom ID di sini, jadi aman. FK merujuk ke ID Soal yang digenerate otomatis di atas)
INSERT INTO opsis (id_soal, text_opsi, is_correct) VALUES
-- Soal 1
(1, '3 + 5', false), (1, 'Buka pintu!', false), (1, 'Jakarta adalah kota', true), (1, 'Siapa namamu?', false),
-- Soal 2
(2, 'Logika', true), (2, 'Fisika', false), (2, 'Biologi', false), (2, 'Sosiologi', false),
-- Soal 3
(3, 'Deklaratif', false), (3, 'Imperatif (Perintah)', true), (3, 'Interogatif', false), (3, 'Proposisi', false),
-- Soal 4
(4, 'Benar', true), (4, 'Salah', false), (4, 'Abstrak', false), (4, 'Relatif', false),
-- Soal 5
(5, 'Kata/Ilmu', true), (5, 'Angka', false), (5, 'Bintang', false), (5, 'Bumi', false),
-- Soal 7 (Level 2)
(7, 'Ayam adalah unggas', false), (7, '1+1=2', false), (7, 'Matahari terbit di barat', true), (7, 'Es itu dingin', false),
-- Soal 8
(8, 'p ^ q Benar', false), (8, 'p v q Benar', true), (8, 'p -> q Salah', true), (8, 'p <-> q Benar', false),
-- Soal 9
(9, 'p, q, r', true), (9, '1, 2, 3', false), (9, 'x, y, z', false), (9, '@, #, $', false),
-- Soal 10
(10, 'Salah', true), (10, 'Ragu', false), (10, 'Mungkin', false), (10, 'Valid', false),
-- Soal 11
(11, 'Kata hubung logika', true), (11, 'Tanda baca', false), (11, 'Huruf kapital', false), (11, 'Angka romawi', false),
-- Soal 13 (Level 3)
(13, 'Beberapa siswa tidak lulus ujian', true), (13, 'Semua siswa tidak lulus', false), (13, 'Tidak ada siswa lulus', false), (13, 'Saya lulus ujian', false),
-- Soal 14
(14, 'Hari ini cerah', false), (14, 'Hari ini tidak hujan', true), (14, 'Besok hujan', false), (14, 'Kemarin hujan', false),
-- Soal 15
(15, '~', true), (15, 'v', false), (15, '^', false), (15, '->', false),
-- Soal 16
(16, '2 + 2 = 4', false), (16, '2 + 2 tidak sama dengan 5', true), (16, '5 - 2 = 2', false), (16, '2 x 2 = 5', false),
-- Soal 17
(17, 'Budi tidak rajin atau tidak pandai', true), (17, 'Budi malas dan bodoh', false), (17, 'Budi rajin tapi bodoh', false), (17, 'Budi tidak rajin dan tidak pandai', false),
-- Soal 19 (Level 4)
(19, 'p Benar, q Benar', true), (19, 'p Benar, q Salah', false), (19, 'p Salah, q Benar', false), (19, 'p Salah, q Salah', false),
-- Soal 20
(20, 'Konjungsi', false), (20, 'Disjungsi', true), (20, 'Negasi', false), (20, 'Implikasi', false),
-- Soal 21
(21, 'p Benar, q Salah', false), (21, 'p Salah, q Benar', false), (21, 'p Salah, q Salah', true), (21, 'p Benar, q Benar', false),
-- Soal 22
(22, 'Benar (karena kambing makan rumput)', false), (22, 'Salah (karena sapi tidak makan daging)', true), (22, 'Tidak tahu', false), (22, 'Mungkin', false),
-- Soal 23
(23, 'Disjungsi', true), (23, 'Konjungsi', false), (23, 'Negasi', false), (23, 'Implikasi', false),
-- Soal 25 (Level 5)
(25, 'p Benar, q Salah', true), (25, 'p Benar, q Benar', false), (25, 'p Salah, q Benar', false), (25, 'p Salah, q Salah', false),
-- Soal 26
(26, 'Anteseden', true), (26, 'Konsekuen', false), (26, 'Kesimpulan', false), (26, 'Premis', false),
-- Soal 27
(27, 'Anteseden', false), (27, 'Konsekuen', true), (27, 'Sebab', false), (27, 'Akibat', false),
-- Soal 28
(28, 'Salah (B -> S = S)', true), (28, 'Benar', false), (28, 'Ragu', false), (28, 'Tidak valid', false),
-- Soal 29
(29, 'Jika p maka q', true), (29, 'p dan q', false), (29, 'p atau q', false), (29, 'p jika dan hanya jika q', false),
-- Soal 31 (Level 6)
(31, 'Nilai p dan q sama', true), (31, 'Nilai p dan q beda', false), (31, 'p benar q salah', false), (31, 'p salah q benar', false),
-- Soal 32
(32, '<->', true), (32, '->', false), (32, '=>', false), (32, '=', false),
-- Soal 33
(33, 'Biimplikasi', true), (33, 'Implikasi', false), (33, 'Konjungsi', false), (33, 'Disjungsi', false),
-- Soal 34
(34, 'Salah satu benar, satu salah', true), (34, 'Keduanya benar', false), (34, 'Keduanya salah', false), (34, 'Tidak ada syarat', false),
-- Soal 35
(35, 'x genap jika hanya jika x habis dibagi 2', true), (35, 'Jika hujan maka basah', false), (35, 'Budi makan atau minum', false), (35, 'Semua orang mati', false),
-- Soal 37 (Level 7)
(37, 'Tautologi', true), (37, 'Kontradiksi', false), (37, 'Kontingensi', false), (37, 'Fallacy', false),
-- Soal 38
(38, 'Kontradiksi', true), (38, 'Tautologi', false), (38, 'Valid', false), (38, 'Ekuivalen', false),
-- Soal 39
(39, 'Tautologi', true), (39, 'Kontradiksi', false), (39, 'Modus', false), (39, 'Negasi', false),
-- Soal 40
(40, 'Kontradiksi', true), (40, 'Tautologi', false), (40, 'Implikasi', false), (40, 'Ekuivalen', false),
-- Soal 41
(41, 'Bisa benar bisa salah', true), (41, 'Selalu benar', false), (41, 'Selalu salah', false), (41, 'Tidak logis', false),
-- Soal 43 (Level 8)
(43, 'Tabel kebenarannya sama persis', true), (43, 'Kalimatnya sama', false), (43, 'Panjangnya sama', false), (43, 'Variabelnya beda', false),
-- Soal 44
(44, '~p v ~q', true), (44, '~p ^ ~q', false), (44, 'p v q', false), (44, '~p -> ~q', false),
-- Soal 45
(45, '~p v q', true), (45, 'p ^ ~q', false), (45, 'q -> p', false), (45, '~q -> p', false),
-- Soal 46
(46, 'p', true), (46, '~p', false), (46, 'q', false), (46, 'Salah', false),
-- Soal 47
(47, '≡', true), (47, '=', false), (47, '!=', false), (47, '~', false),
-- Soal 49 (Level 9)
(49, 'Semua / Setiap', true), (49, 'Beberapa', false), (49, 'Ada', false), (49, 'Sebagian', false),
-- Soal 50
(50, '∀', true), (50, '∃', false), (50, 'E', false), (50, 'A', false),
-- Soal 51
(51, 'Untuk semua', true), (51, 'Terdapat', false), (51, 'Tidak ada', false), (51, 'Himpunan', false),
-- Soal 52
(52, 'Ada orang yang tidak senang', true), (52, 'Semua orang sedih', false), (52, 'Tidak ada orang senang', false), (52, 'Saya tidak senang', false),
-- Soal 53
(53, 'Setiap warga negara wajib pajak', true), (53, 'Ada siswa yang sakit', false), (53, 'Beberapa burung terbang', false), (53, 'Budi adalah siswa', false),
-- Soal 55 (Level 10)
(55, 'Beberapa / Ada', true), (55, 'Semua', false), (55, 'Setiap', false), (55, 'Seluruh', false),
-- Soal 56
(56, 'Terdapat / Ada', true), (56, 'Untuk semua', false), (56, 'Jika maka', false), (56, 'Dan', false),
-- Soal 57
(57, 'Semua siswa tidak bolos (masuk)', true), (57, 'Ada siswa yang masuk', false), (57, 'Semua siswa bolos', false), (57, 'Tidak ada siswa masuk', false),
-- Soal 58
(58, 'Minimal satu x benar', true), (58, 'Semua x benar', false), (58, 'Tidak ada x benar', false), (58, 'x salah semua', false),
-- Soal 59
(59, 'Saling menggantikan saat dinegasikan', true), (59, 'Tidak berhubungan', false), (59, 'Sama persis', false), (59, 'Berlawanan arti saja', false),
-- Soal 61 (Level 11 Pemrograman)
(61, 'Variabel', true), (61, 'Fungsi', false), (61, 'Loop', false), (61, 'Class', false),
-- Soal 62
(62, 'Integer', true), (62, 'Float', false), (62, 'String', false), (62, 'Boolean', false),
-- Soal 63
(63, 'Teks / Karakter', true), (63, 'Angka', false), (63, 'Benar/Salah', false), (63, 'Desimal', false),
-- Soal 64
(64, 'namaPengguna', true), (64, 'NamaPengguna', false), (64, 'nama_pengguna', false), (64, 'NAMAPENGGUNA', false),
-- Soal 65
(65, 'False', true), (65, 'True', false), (65, 'Null', false), (65, '0', false),
-- Soal 67 (Level 12)
(67, '1 (Sisa bagi)', true), (67, '3.33', false), (67, '3', false), (67, '0', false),
-- Soal 68
(68, 'Perkalian', true), (68, 'Pangkat', false), (68, 'Pointer', false), (68, 'Pembagian', false),
-- Soal 69
(69, '6', true), (69, '5', false), (69, '4', false), (69, 'Error', false),
-- Soal 70
(70, 'Kurung -> Kali/Bagi -> Tambah/Kurang', true), (70, 'Tambah -> Kali', false), (70, 'Kiri ke kanan selalu', false), (70, 'Kali -> Kurung', false),
-- Soal 71
(71, '14', true), (71, '20', false), (71, '10', false), (71, '24', false),
-- Soal 73 (Level 13)
(73, 'Kesamaan nilai', true), (73, 'Assignment', false), (73, 'Tipe data', false), (73, 'Logika', false),
-- Soal 74
(74, 'False', true), (74, 'True', false), (74, 'Error', false), (74, 'Null', false),
-- Soal 75
(75, 'Tidak sama dengan', true), (75, 'Sama dengan', false), (75, 'Lebih besar', false), (75, 'Negasi', false),
-- Soal 76
(76, 'True', true), (76, 'False', false), (76, 'Error', false), (76, 'Undefined', false),
-- Soal 77
(77, '<=', true), (77, '=<', false), (77, '=>', false), (77, '>=', false),
-- Soal 79 (Level 14)
(79, 'False', true), (79, 'True', false), (79, 'Null', false), (79, 'Error', false),
-- Soal 80
(80, 'True', true), (80, 'False', false), (80, 'Null', false), (80, 'Error', false),
-- Soal 81
(81, '!', true), (81, '!=', false), (81, '~', false), (81, 'NOT', false),
-- Soal 82
(82, 'False', true), (82, 'True', false), (82, 'Null', false), (82, 'Error', false),
-- Soal 83
(83, 'NOT', true), (83, 'AND', false), (83, 'OR', false), (83, 'XOR', false),
-- Soal 85 (Level 15)
(85, 'If-Else', true), (85, 'Loop', false), (85, 'Array', false), (85, 'Function', false),
-- Soal 86
(86, 'Kondisi if salah', true), (86, 'Kondisi if benar', false), (86, 'Selalu dijalankan', false), (86, 'Error terjadi', false),
-- Soal 87
(87, 'Memeriksa kondisi', true), (87, 'Mengulang kode', false), (87, 'Mendefinisikan variabel', false), (87, 'Keluar program', false),
-- Soal 88
(88, 'If-Else If', true), (88, 'For Loop', false), (88, 'While', false), (88, 'Function', false),
-- Soal 89
(89, 'Boolean', true), (89, 'Integer', false), (89, 'String', false), (89, 'Void', false),
-- Soal 91 (Level 16)
(91, 'If di dalam If', true), (91, 'If sejajar', false), (91, 'If tanpa Else', false), (91, 'If error', false),
-- Soal 92
(92, 'Blok else if diabaikan', true), (92, 'Cek kondisi kedua', false), (92, 'Error', false), (92, 'Semua dijalankan', false),
-- Soal 93
(93, 'Nested If', true), (93, 'Variabel', false), (93, 'Komentar', false), (93, 'Spasi', false),
-- Soal 94
(94, 'Switch Case', true), (94, 'Looping', false), (94, 'Array', false), (94, 'Class', false),
-- Soal 95
(95, 'Mengecek 2 kondisi sekaligus', true), (95, 'Memilih salah satu', false), (95, 'Mengulang', false), (95, 'Menambah nilai', false),
-- Soal 97 (Level 17)
(97, 'For Loop', true), (97, 'While Loop', false), (97, 'If Else', false), (97, 'Switch', false),
-- Soal 98
(98, 'Increment', true), (98, 'Inisialisasi', false), (98, 'Kondisi', false), (98, 'Output', false),
-- Soal 99
(99, 'Menghentikan loop', true), (99, 'Memulai loop', false), (99, 'Mempercepat loop', false), (99, 'Error', false),
-- Soal 100
(100, 'Infinite Loop', true), (100, 'Forever Loop', false), (100, 'Bug', false), (100, 'Stack Overflow', false),
-- Soal 101
(101, '5 kali (0-4)', true), (101, '4 kali', false), (101, '6 kali', false), (101, '1 kali', false),
-- Soal 103 (Level 18)
(103, 'True', true), (103, 'False', false), (103, 'Null', false), (103, 'Error', false),
-- Soal 104
(104, 'Do-While jalan min 1x', true), (104, 'While jalan min 1x', false), (104, 'Sama saja', false), (104, 'Do-while lebih cepat', false),
-- Soal 105
(105, 'Jumlah iterasi belum pasti', true), (105, 'Jumlah iterasi pasti', false), (105, 'Untuk array', false), (105, 'Untuk matematika', false),
-- Soal 106
(106, 'Infinite Loop jika lupa update', true), (106, 'Syntax sulit', false), (106, 'Lambat', false), (106, 'Tidak bisa nested', false),
-- Soal 107
(107, '1 kali', true), (107, '0 kali', false), (107, '2 kali', false), (107, 'Tak terhingga', false),
-- Soal 109 (Level 19)
(109, '0', true), (109, '1', false), (109, '-1', false), (109, 'Acak', false),
-- Soal 110
(110, 'A[0]', true), (110, 'A[1]', false), (110, 'A.first', false), (110, 'A(1)', false),
-- Soal 111
(111, '4', true), (111, '5', false), (111, '3', false), (111, '6', false),
-- Soal 112
(112, 'Kumpulan data sejenis', true), (112, 'Satu data saja', false), (112, 'Kode program', false), (112, 'Gambar', false),
-- Soal 113
(113, 'Index Out of Bounds', true), (113, 'Syntax Error', false), (113, 'Logic Error', false), (113, 'Null Pointer', false),
-- Soal 115 (Level 20)
(115, 'Algoritma', true), (115, 'Logaritma', false), (115, 'Aritmatika', false), (115, 'Aljabar', false),
-- Soal 116
(116, 'Kode semu mirip bahasa asli', true), (116, 'Kode mesin', false), (116, 'Diagram gambar', false), (116, 'Bahasa C++', false),
-- Soal 117
(117, 'Keputusan / Kondisi', true), (117, 'Proses', false), (117, 'Input/Output', false), (117, 'Mulai/Selesai', false),
-- Soal 118
(118, 'Jajargenjang', true), (118, 'Kotak', false), (118, 'Lingkaran', false), (118, 'Panah', false),
-- Soal 119
(119, 'Efisien dan Berhenti', true), (119, 'Panjang', false), (119, 'Rumit', false), (119, 'Tanpa batas', false),
-- Soal 121 (Level 21 Silogisme)
(121, 'q benar', true), (121, 'p benar', false), (121, 'q salah', false), (121, 'Tidak sah', false),
-- Soal 122
(122, 'Tanah basah', true), (122, 'Tidak hujan', false), (122, 'Tanah kering', false), (122, 'Banjir', false),
-- Soal 123
(123, 'p->q, p, ∴q', true), (123, 'p->q, ~q, ∴~p', false), (123, 'p->q, q->r, ∴p->r', false), (123, 'p v q, ~p, ∴q', false),
-- Soal 124
(124, 'Kebenaran anteseden', true), (124, 'Kebenaran konsekuen', false), (124, 'Panjang kalimat', false), (124, 'Siapa yang bicara', false),
-- Soal 125
(125, 'B pasti terjadi', true), (125, 'B mungkin terjadi', false), (125, 'A tidak terjadi', false), (125, 'Salah semua', false),
-- Soal 127 (Level 22)
(127, '~p benar', true), (127, 'p benar', false), (127, '~q benar', false), (127, 'Tidak sah', false),
-- Soal 128
(128, 'Lampu mati (Tidak nyala)', true), (128, 'Lampu nyala', false), (128, 'Ada listrik', false), (128, 'Konslet', false),
-- Soal 129
(129, 'p->q, ~q, ∴~p', true), (129, 'p->q, p, ∴q', false), (129, 'p->q, q, ∴p', false), (129, 'p v q, ~p, ∴q', false),
-- Soal 130
(130, 'Tidak Sah (Fallacy)', true), (130, 'Sah', false), (130, 'Modus Ponens', false), (130, 'Modus Tollens', false),
-- Soal 131
(131, 'Negasi konsekuen', true), (131, 'Afirmasi anteseden', false), (131, 'Dua premis', false), (131, 'Tiga kalimat', false),
-- Soal 133 (Level 23)
(133, 'Dua implikasi', true), (133, 'Dua negasi', false), (133, 'Dua disjungsi', false), (133, 'Dua konjungsi', false),
-- Soal 134
(134, 'p -> r', true), (134, 'r -> p', false), (134, 'p -> q', false), (134, 'Tidak ada', false),
-- Soal 135
(135, 'Transitif', true), (135, 'Reflektif', false), (135, 'Simetris', false), (135, 'Komutatif', false),
-- Soal 136
(136, 'Jika rajin, bahagia', true), (136, 'Jika lulus, rajin', false), (136, 'Jika bahagia, lulus', false), (136, 'Tidak sah', false),
-- Soal 137
(137, 'Konsekuen P1 = Anteseden P2', true), (137, 'Konsekuen P1 = Konsekuen P2', false), (137, 'Sama subjek', false), (137, 'Sama predikat', false),
-- Soal 139 (Level 24)
(139, 'Socrates fana', true), (139, 'Socrates dewa', false), (139, 'Semua fana', false), (139, 'Tidak sah', false),
-- Soal 140
(140, 'Semua', true), (140, 'Beberapa', false), (140, 'Ada', false), (140, 'Saya', false),
-- Soal 141
(141, 'Menghubungkan mayor dan minor', true), (141, 'Kesimpulan', false), (141, 'Subjek kalimat', false), (141, 'Predikat kalimat', false),
-- Soal 142
(142, 'Term tengah (M)', true), (142, 'Subjek (S)', false), (142, 'Predikat (P)', false), (142, 'Kopula', false),
-- Soal 143
(143, 'Premis Mayor, Minor, Kesimpulan semua Universal Positif', true), (143, 'Semua negatif', false), (143, 'Campuran', false), (143, 'Partikular', false),
-- Soal 145 (Level 25)
(145, 'Kucing tidak bertelur', true), (145, 'Kucing bertelur', false), (145, 'Kucing adalah burung', false), (145, 'Tidak sah', false),
-- Soal 146
(146, 'Negatif', true), (146, 'Positif', false), (146, 'Netral', false), (146, 'Universal', false),
-- Soal 147
(147, 'Tidak ada kesimpulan sah', true), (147, 'Kesimpulan negatif', false), (147, 'Kesimpulan positif', false), (147, 'Kesimpulan ganda', false),
-- Soal 148
(148, 'Beberapa C adalah B', true), (148, 'Semua C adalah B', false), (148, 'Tidak ada C yang B', false), (148, 'Semua A adalah C', false),
-- Soal 149
(149, 'Minimal satu (Partikular)', true), (149, 'Semua (Universal)', false), (149, 'Tidak ada', false), (149, 'Kebanyakan', false),
-- Soal 151 (Level 26)
(151, 'Fallacy', true), (151, 'Validitas', false), (151, 'Sogisme', false), (151, 'Entimen', false),
-- Soal 152
(152, 'Ad Hominem', true), (152, 'Ad Populum', false), (152, 'Strawman', false), (152, 'Circular Reasoning', false),
-- Soal 153
(153, 'Ad Populum (Bandwagon)', true), (153, 'Ad Hominem', false), (153, 'Slippery Slope', false), (153, 'Red Herring', false),
-- Soal 154
(154, 'Membuat argumen lawan jadi lemah/konyol lalu menyerangnya', true), (154, 'Menyerang fisik', false), (154, 'Mengancam', false), (154, 'Kasihan', false),
-- Soal 155
(155, 'Sebab-Akibat yang salah', true), (155, 'Pemilihan umum', false), (155, 'Ejaan kata', false), (155, 'Definisi', false),
-- Soal 157 (Level 27)
(157, 'Himpunan', true), (157, 'Garis', false), (157, 'Titik', false), (157, 'Sudut', false),
-- Soal 158
(158, 'Semua A adalah B', true), (158, 'Sebagian A adalah B', false), (158, 'Tidak ada A yang B', false), (158, 'B adalah A', false),
-- Soal 159
(159, 'Beberapa / Ada (Sebagian)', true), (159, 'Semua', false), (159, 'Tidak ada', false), (159, 'Atau', false),
-- Soal 160
(160, 'Tidak ada hubungan (Saling lepas)', true), (160, 'Beririsan', false), (160, 'Sama persis', false), (160, 'Bagian dari', false),
-- Soal 161
(161, 'Dua lingkaran berpotongan di tengah', true), (161, 'Satu lingkaran dalam lingkaran lain', false), (161, 'Dua lingkaran terpisah', false), (161, 'Satu lingkaran saja', false),
-- Soal 163 (Level 28)
(163, 'Sah (Valid)', true), (163, 'Tidak sah', false), (163, 'Ragu-ragu', false), (163, 'Salah', false),
-- Soal 164
(164, 'Mengikuti aturan logika dari premis', true), (164, 'Sesuai kenyataan', false), (164, 'Disukai banyak orang', false), (164, 'Panjang kalimatnya', false),
-- Soal 165
(165, 'Khusus ke Umum (Generalisasi)', true), (165, 'Umum ke Khusus', false), (165, 'Umum ke Umum', false), (165, 'Khusus ke Khusus', false),
-- Soal 166
(166, 'Umum ke Khusus', true), (166, 'Khusus ke Umum', false), (166, 'Acak', false), (166, 'Statistik', false),
-- Soal 167
(167, 'Induksi yang lemah', true), (167, 'Deduksi valid', false), (167, 'Silogisme', false), (167, 'Modus Ponens', false),
-- Soal 169 (Level 29)
(169, 'Tidak Sah (Affirming the Consequent)', true), (169, 'Sah', false), (169, 'Modus Ponens', false), (169, 'Modus Tollens', false),
-- Soal 170
(170, 'Salah / Tidak valid', true), (170, 'Benar', false), (170, 'Sangat kuat', false), (170, 'Pasti', false),
-- Soal 171
(171, 'Silogisme yang dipendekkan', true), (171, 'Silogisme salah', false), (171, 'Logika baru', false), (171, 'Debat kusir', false),
-- Soal 172
(172, 'Premis tersembunyi (Implisit)', true), (172, 'Premis mayor', false), (172, 'Kesimpulan', false), (172, 'Kopula', false),
-- Soal 173
(173, 'Orang rajin pasti sukses', true), (173, 'Dia orang', false), (173, 'Sukses itu tujuan', false), (173, 'Dia malas', false),
-- Soal 175 (Level 30)
(175, 'Konjungsi dan Disjungsi', true), (175, 'Negasi saja', false), (175, 'Hanya Implikasi', false), (175, 'Biimplikasi', false),
-- Soal 176
(176, 'q v s', true), (176, 'p v r', false), (176, 'q ^ s', false), (176, '~q v ~s', false),
-- Soal 177
(177, 'Mencari kontradiksi dari pengandaian', true), (177, 'Mencari kesamaan', false), (177, 'Menghitung angka', false), (177, 'Eksperimen', false),
-- Soal 178
(178, 'Bertentangan dengan dirinya sendiri', true), (178, 'Sangat jelas', false), (178, 'Lucu', false), (178, 'Panjang', false),
-- Soal 179
(179, 'Di antara 0 dan 1 (Samar)', true), (179, 'Hanya 0 dan 1', false), (179, 'Negatif', false), (179, 'Imajiner', false);

[🇹🇷 Türkçe](README.tr.md) | [🇺🇸 English](README.md)

# 🛡️ Succinct Airdrop Atomik Kurtarma Aracı

Ele geçirilmiş cüzdanlardan Flashbots MEV koruması kullanarak token'ları güvenle talep etmenizi sağlayan araç. Bu araç, Succinct Foundation airdrop token'larını atomik olarak talep etmeyi ve transfer etmeyi sağlayarak frontrunning saldırılarını önler.

## 🚨 Problem

Cüzdanınız ele geçirilmiş (private key'iniz açığa çıkmış olabilir) ancak talep edilmemiş airdrop token'larınız var. Geleneksel talep yöntemleri, MEV bot'ları veya mempool'u izleyen saldırganlar tarafından anında çalınma riskini taşır.

## ✅ Çözüm

Bu araç **Flashbots bundle'larını** kullanarak hem talep hem de transfer işlemlerini tek bir blokta atomik olarak gerçekleştirir, böylece kimse token'larınızı talep ile transfer arasında ele geçiremez.

## 🔄 Nasıl Çalışır

### 1. Kimlik Doğrulama Aşaması
- Succinct talep API'sinden nonce istenir
- SIWE (Sign-In With Ethereum) mesajı imzalanır
- JWT kimlik doğrulama token'ı alınır

### 2. Talep Verisi Alma
- API'den uygunluk kanıtınız alınır
- Talep indeksi, token miktarı ve Merkle kanıtı elde edilir

### 3. Atomik Yürütme
- **İşlem 1**: Token'ları ele geçirilmiş cüzdana talep eder
- **İşlem 2**: Token'ları hemen güvenli cüzdana transfer eder
- Her ikisi aynı blokta yürütülür veya birlikte başarısız olur

## 🛠️ Kurulum

### Önkoşullar
**Node.js & npm:**
- **İndirin**: [nodejs.org](https://nodejs.org) adresini ziyaret edin ve LTS sürümünü indirin
- **Kurulumu doğrulayın**: Terminalde `node --version` ve `npm --version` komutlarını çalıştırın
- **Minimum sürümler**: Node.js 16+ ve npm 8+ önerilir

**Diğer gereksinimler:**
- Alchemy/Infura RPC uç noktaları
- Ele geçirilmiş cüzdan private key'i
- Gas ücretleri için ETH'si olan sponsor cüzdan

### Ortam Değişkenleri
`.env` dosyasını projenizin kök dizininde oluşturun:

```bash
COMPROMISED_KEY=ele_gecirilmis_private_key
SPONSOR_KEY=sponsor_private_key  
NEW_WALLET_ADDRESS=yeni_guvenli_cuzdan_adresi
ALCHEMY_URL=https://eth-mainnet.g.alchemy.com/v2/YOUR-API-KEY
INFURA_URL=https://mainnet.infura.io/v3/YOUR-PROJECT-ID
```

### 🔑 API Anahtarları Alma

**Alchemy (Önerilen):**
1. [alchemy.com](https://alchemy.com) adresini ziyaret edin ve ücretsiz hesap oluşturun
2. Yeni uygulama oluşturun → "Ethereum Mainnet" seçin
3. API anahtarınızı kopyalayın ve yukarıdaki URL'de `YOUR-API-KEY` yerine yapıştırın

**Infura (Yedek):**
1. [infura.io](https://infura.io) adresini ziyaret edin ve ücretsiz hesap oluşturun  
2. Yeni proje oluşturun → "Ethereum Mainnet" seçin
3. Proje ID'nizi kopyalayın ve yukarıdaki URL'de `YOUR-PROJECT-ID` yerine yapıştırın

💡 **Neden ikisi birden?** Araç RPC yedekleme kullanır - bir servis çökerse otomatik olarak diğerine geçer, maksimum güvenilirlik sağlar.

### Kurulum
```bash
# Gerekli bağımlılıkları yükleyin
npm install ethers @flashbots/ethers-provider-bundle axios dotenv

# Kurtarma aracını çalıştırın
node succinct-claim.js
```

### 🪟 Windows PowerShell Sorunları
Windows'ta `ExecutionPolicy` hatası alırsanız, önce şunu çalıştırın:
```powershell
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process
```
Ardından npm install komutu ile devam edin. Bu, yalnızca mevcut oturum için geçici olarak script çalıştırmaya izin verir.

### Bağımlılıklar Açıklaması
- **ethers**: Ethereum blockchain etkileşim kütüphanesi
- **@flashbots/ethers-provider-bundle**: Resmi Flashbots MEV koruma sağlayıcısı
- **axios**: API iletişimi için HTTP istemcisi
- **dotenv**: Ortam değişkeni yönetimi

## ⛽ Gas Ücreti Yapılandırması

Araç, normal ağ koşulları için çalışan varsayılan gas ayarlarını kullanır:

```javascript
const gasSettings = {
  maxFeePerGas: ethers.parseUnits("6", "gwei"),        // Maksimum gas fiyatı
  maxPriorityFeePerGas: ethers.parseUnits("2", "gwei"), // Öncelik bahşişi
};
```

### 🔧 Gas Ücretlerini Ayarlama

**Gas ücretlerini ne zaman artırmalısınız:**
- Ağ tıkanık ([etherscan.io/gastracker](https://etherscan.io/gastracker) kontrol edin)
- Bundle'ınız dahil edilmeyi başaramıyor
- Zaman açısından kritik kurtarma operasyonu

**Ağ durumuna göre önerilen ayarlar:**
```javascript
// Düşük tıkanıklık (ucuz ama daha yavaş)
maxFeePerGas: ethers.parseUnits("3", "gwei")
maxPriorityFeePerGas: ethers.parseUnits("1", "gwei")

// Normal koşullar (varsayılan)
maxFeePerGas: ethers.parseUnits("6", "gwei")
maxPriorityFeePerGas: ethers.parseUnits("2", "gwei")

// Yüksek tıkanıklık (pahalı ama daha hızlı)
maxFeePerGas: ethers.parseUnits("15", "gwei")
maxPriorityFeePerGas: ethers.parseUnits("5", "gwei")
```

💡 **Pro İpucu**: Çalıştırmadan önce mevcut gas fiyatlarını kontrol edin. Yüksek öncelik ücretleri, bundle'ınızın hedef blokta dahil edilme şansını artırır.

## 🔒 Güvenlik Özellikleri

- **✅ Atomik Yürütme**: Her iki işlem birlikte başarılı olur veya birlikte başarısız olur
- **✅ MEV Koruması**: Flashbots özel mempool kullanır
- **✅ Frontrun Önleme**: İşlemler yürütülene kadar görünmez
- **✅ Çoklu RPC Yedekleme**: Gereksiz ağ bağlantısı

## ⚠️ Önemli Hususlar

- **Gas Gereksinimleri**: Sponsor cüzdanında yeterli ETH bulunmalı
- **Tek Fırsat**: Çoğu airdrop tek talep denemesi sunar
- **Zamanlama Hassas**: Hedef blok dahil edilmesi için güncel olmalı
- **Önce Test Edin**: Mümkünse testnet'te doğrulayın

## 🎯 Kullanım Durumları

Şu durumlardan etkilenmiş cüzdanlardan token kurtarmak için mükemmel:
- Malware tarafından ele geçirilmiş
- Phishing yoluyla açığa çıkmış
- Yanlışlıkla paylaşılmış
- Private key açığa çıkma riski taşıyan

## 📊 Başarı Oranı

Atomik bundle yaklaşımı şu durumlarda %100'e yakın başarı oranı sağlar:
- Yeterli gas ücreti sağlandığında
- Ağ koşulları kararlı olduğunda
- Talep uygunluğu doğrulandığında

## 🤝 Katkıda Bulunma

Bu araç size yardımcı oldu mu? İyileştirme katkıları sunmayı veya sorunları bildirmeyi düşünün. Pull request'ler memnuniyetle karşılanır!

## 💝 Bu Projeyi Destekleyin

Bu araç token'larınızı güvenle kurtarmanıza yardımcı olduysa, sürekli geliştirmeyi desteklemeyi düşünün:

**Ethereum/EVM**: `[0x0a8324Ec1204d906C173A604fcE2D500ce20430e]`

Bağışlarınız bu aracı sürdürmeye ve geliştirmeye yardımcı olur. Her katkı, büyüklüğü ne olursa olsun, derinden takdir edilir ve bu projeyi canlı tutar.

*"Kripto topluluğunun güvenli kalmasına yardım etmek, bir kez kurtarılan cüzdan."*

## ⚡ Hızlı Başlangıç

### 📥 Projeyi İndirin
**Seçenek 1: ZIP İndir (En Kolay)**
1. Bu GitHub sayfasının üst kısmındaki yeşil **"Code"** düğmesine tıklayın
2. **"Download ZIP"** seçeneğini seçin
3. ZIP dosyasını istediğiniz konuma çıkarın
4. **Windows kullanıcıları**: Çıkarılan klasörün içinde sağ tık → **"Terminalde aç"** seçin

**Seçenek 2: Git Clone**
```bash
git clone https://github.com/RealBluee/succinct-airdrop-rescue.git
cd succinct-airdrop-rescue
```

### 🚀 Kurulum ve Ayarlama
1. ✅ Projeyi indirin (yukarıya bakın)
2. Bağımlılıkları yükleyin: `npm install ethers @flashbots/ethers-provider-bundle axios dotenv`
3. `.env` dosyanızı yapılandırın
4. Çalıştırın: `node succinct-claim.js`
5. Token'larınızın güvenle kurtarıldığını izleyin! 🎉

## 📜 Lisans

MIT Lisansı - Kullanmak, değiştirmek ve dağıtmakta serbestsiniz.

---

**Sorumluluk Reddi**: Bu araç yalnızca eğitim ve meşru cüzdan kurtarma amaçları içindir. Kullanıcılar geçerli yasa ve yönetmeliklere uyum sağlamaktan sorumludur. Kullanımdan önce her zaman cüzdan ve token'ların meşru sahipliğini doğrulayın.

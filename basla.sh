#!/bin/bash

echo "================================================"
echo "   PARIBU ARBITRAJ RADAR - LOCALHOST"
echo "================================================"
echo ""

# Node.js kontrolü
if ! command -v node &> /dev/null; then
    echo "❌ [HATA] Node.js yüklü değil!"
    echo ""
    echo "Lütfen Node.js yükleyin: https://nodejs.org"
    echo ""
    exit 1
fi

echo "✅ [OK] Node.js bulundu"
echo ""

# node_modules kontrolü
if [ ! -d "node_modules" ]; then
    echo "📦 [ADIM 1/2] Bağımlılıkları yükleniyor..."
    echo ""
    npm install
    
    if [ $? -ne 0 ]; then
        echo "❌ [HATA] Bağımlılıkları yükleme başarısız!"
        exit 1
    fi
    
    echo "✅ [OK] Bağımlılıklar yüklendi"
    echo ""
else
    echo "✅ [OK] Bağımlılıklar zaten yüklü"
    echo ""
fi

echo "🚀 [ADIM 2/2] Server başlatılıyor..."
echo ""
echo "================================================"
echo "  Server: http://localhost:3000"
echo "  Tarayıcıda index.html dosyasını aç!"
echo "================================================"
echo ""
echo "Durdurmak için: Ctrl + C"
echo ""

# Server'ı başlat
node server.js

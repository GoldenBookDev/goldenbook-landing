// netlify/functions/establishment.js
exports.handler = async (event, context) => {
  const path = event.path;
  const pathParts = path.split('/');
  const establishmentId = pathParts[pathParts.indexOf('establishment') + 1];

  if (!establishmentId) {
    return {
      statusCode: 404,
      headers: { 'Content-Type': 'text/html' },
      body: generateHTML(null, null)
    };
  }

  try {
    // Llamar a Firestore REST API (sin autenticación para lectura pública)
    const firestoreUrl = `https://firestore.googleapis.com/v1/projects/goldenbook-a1cd1/databases/(default)/documents/establishments/${establishmentId}`;
    
    const response = await fetch(firestoreUrl);
    let establishment = null;
    
    if (response.ok) {
      const doc = await response.json();
      if (doc.fields) {
        // Convertir formato de Firestore a objeto normal
        establishment = {};
        Object.keys(doc.fields).forEach(key => {
          const field = doc.fields[key];
          if (field.stringValue) establishment[key] = field.stringValue;
          if (field.arrayValue) establishment[key] = field.arrayValue.values?.map(v => v.stringValue) || [];
        });
      }
    }

    const html = generateHTML(establishment, establishmentId);
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'text/html',
        'Cache-Control': 'public, max-age=3600'
      },
      body: html,
    };
  } catch (error) {
    console.error('Error:', error);
    const html = generateHTML(null, establishmentId);
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'text/html' },
      body: html,
    };
  }
}

function generateHTML(establishment, establishmentId) {
  const title = establishment ? `${establishment.name} | Goldenbook` : 'Goldenbook - Discover Amazing Places';
  const description = establishment 
    ? `📍 Discover ${establishment.name} in ${establishment.address}, ${establishment.city}. Found on Goldenbook - your guide to the best local experiences.`
    : 'Discover amazing places with Goldenbook';
  
  let imageUrl = 'https://goldenbook.app/images/default-establishment.jpg';
  if (establishment?.mainImage) {
    imageUrl = establishment.mainImage;
    if (imageUrl.includes('drive.google.com/file/d/')) {
      const match = imageUrl.match(/\/d\/(.+?)\/view/);
      if (match && match[1]) {
        imageUrl = `https://drive.google.com/uc?export=view&id=${match[1]}`;
      }
    }
  }

  const url = `https://meek-toffee-0a1ea2.netlify.app/establishment/${establishmentId || ''}`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    
    <!-- SEO -->
    <meta name="description" content="${description}">
    
    <!-- Open Graph / Facebook / WhatsApp -->
    <meta property="og:type" content="website">
    <meta property="og:url" content="${url}">
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${description}">
    <meta property="og:image" content="${imageUrl}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:site_name" content="Goldenbook">
    
    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image">
    <meta property="twitter:url" content="${url}">
    <meta property="twitter:title" content="${title}">
    <meta property="twitter:description" content="${description}">
    <meta property="twitter:image" content="${imageUrl}">
    
    <style>
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            margin: 0;
            padding: 20px;
            background: linear-gradient(135deg, #E8A756 0%, #DAA520 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .container {
            background: white;
            border-radius: 20px;
            padding: 40px;
            max-width: 500px;
            text-align: center;
            box-shadow: 0 20px 60px rgba(0,0,0,0.1);
        }
        .app-logo {
            width: 80px;
            height: 80px;
            margin: 0 auto 20px;
            background: #E8A756;
            border-radius: 18px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 40px;
            color: white;
        }
        .establishment-image {
            width: 100%;
            max-width: 300px;
            height: 200px;
            border-radius: 15px;
            object-fit: cover;
            margin: 0 auto 20px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }
        .establishment-name {
            font-size: 28px;
            font-weight: bold;
            color: #1A1A2E;
            margin-bottom: 10px;
        }
        .establishment-address {
            color: #666;
            margin-bottom: 15px;
        }
        .establishment-category {
            display: inline-block;
            background: #F0F0F0;
            color: #666;
            padding: 6px 16px;
            border-radius: 20px;
            font-size: 14px;
            margin-bottom: 30px;
        }
        .subtitle {
            color: #666;
            margin-bottom: 30px;
            line-height: 1.4;
        }
        .download-button {
            background: #E8A756;
            color: white;
            padding: 16px 32px;
            border: none;
            border-radius: 12px;
            font-size: 18px;
            font-weight: 600;
            text-decoration: none;
            display: block;
            margin: 10px 0;
            cursor: pointer;
            transition: transform 0.2s;
        }
        .download-button:hover {
            transform: translateY(-2px);
        }
        .footer-text {
            color: #999; 
            font-size: 14px; 
            margin-top: 30px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="app-logo">📍</div>
        
        ${establishment ? `
            <img src="${imageUrl}" alt="${establishment.name}" class="establishment-image" onerror="this.style.display='none'">
            <h1 class="establishment-name">${establishment.name.toUpperCase()}</h1>
            <p class="establishment-address">${establishment.address}, ${establishment.city}</p>
            ${establishment.categories && establishment.categories.length > 0 ? 
                `<span class="establishment-category">${establishment.categories[0]}</span>` : ''
            }
        ` : `
            <h1 class="establishment-name">AMAZING PLACE</h1>
            <p class="establishment-address">Discover this place on Goldenbook</p>
        `}
        
        <p class="subtitle">
            Download Goldenbook to discover amazing places like this and many more!
        </p>
        
        <a href="https://apps.apple.com/app/goldenbook/id123456789" class="download-button">
            📱 Download for iOS
        </a>
        <a href="https://play.google.com/store/apps/details?id=com.bwebstudio.goldenbook" class="download-button">
            🤖 Download for Android
        </a>
        
        <p class="footer-text">
            Your guide to the best local experiences
        </p>
    </div>
    
    <script>
        // Intentar abrir la app si viene de WhatsApp
        const deepLink = 'goldenbook://establishment/${establishmentId || ''}';
        
        function tryOpenApp() {
            window.location.href = deepLink;
            setTimeout(() => {
                const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
                const isAndroid = /Android/.test(navigator.userAgent);
                
                if (isIOS) {
                    window.location.href = 'https://apps.apple.com/app/goldenbook/id123456789';
                } else if (isAndroid) {
                    window.location.href = 'https://play.google.com/store/apps/details?id=com.bwebstudio.goldenbook';
                }
            }, 2500);
        }
        
        // Auto-redirect si viene de apps de chat
        if (document.referrer && (document.referrer.includes('whatsapp') || document.referrer.includes('telegram'))) {
            setTimeout(tryOpenApp, 1000);
        }
    </script>
</body>
</html>`;
}

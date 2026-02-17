// 距離計算・エリアランク自動判定エンジン
// 本社（オフィスM2）から配送先市役所までの直線距離でランク判定

const DistanceCalculator = {
  // 本社座標（大阪市西区北堀江3-6-8）
  OFFICE_LAT: 34.6725,
  OFFICE_LNG: 135.4882,

  // ランク距離閾値（km）
  RANK_THRESHOLDS: [
    { rank: 'A', maxKm: 15,  label: 'Aランク（15km圏内）', regions: '大阪市' },
    { rank: 'B', maxKm: 30,  label: 'Bランク（30km圏内）', regions: '大阪府,神戸市,阪神,京都市,山城,奈良県' },
    { rank: 'C', maxKm: 50,  label: 'Cランク（50km圏内）', regions: '南丹' },
    { rank: 'D', maxKm: 100, label: 'Dランク（100km圏内）', regions: '東播磨,北播磨,中播磨,丹波,滋賀県,和歌山県' },
    { rank: 'E', maxKm: 150, label: 'Eランク（150km圏内）', regions: '淡路,西播磨,中丹,三重県' },
    { rank: 'F', maxKm: 200, label: 'Fランク（200km圏内）', regions: '但馬,丹後,愛知県,岐阜県,徳島県,香川県' },
    { rank: 'G', maxKm: 300, label: 'Gランク（300km圏内）', regions: '岡山県,鳥取県,福井県' },
    { rank: 'H', maxKm: 400, label: 'Hランク（400km圏内）', regions: '広島県,愛媛県,高知県,島根県,石川県,富山県' },
    { rank: 'I', maxKm: 500, label: 'Iランク（500km圏内）', regions: '山口県' },
  ],

  /**
   * ハーバーサイン公式で2点間の直線距離を計算（km）
   */
  calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // 地球の半径（km）
    const dLat = this.toRad(lat2 - lat1);
    const dLng = this.toRad(lng2 - lng1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  },

  toRad(deg) {
    return deg * (Math.PI / 180);
  },

  /**
   * 本社からの直線距離を計算
   */
  getDistanceFromOffice(lat, lng) {
    return this.calculateDistance(this.OFFICE_LAT, this.OFFICE_LNG, lat, lng);
  },

  /**
   * 距離からランクを判定
   * @returns { rank, label, distance, regions } or null（ランク外）
   */
  getRankFromDistance(distanceKm) {
    for (const threshold of this.RANK_THRESHOLDS) {
      if (distanceKm <= threshold.maxKm) {
        return {
          rank: threshold.rank,
          label: threshold.label,
          distance: Math.round(distanceKm * 10) / 10,
          regions: threshold.regions,
          maxKm: threshold.maxKm
        };
      }
    }
    // 500km超 → ランク外
    return null;
  },

  /**
   * 住所文字列から市区町村名を抽出
   */
  extractCityName(address) {
    if (!address) return null;
    
    // 都道府県を除去
    let cleaned = address.replace(/^(北海道|東京都|大阪府|京都府|.{2,3}県)/, '');
    
    // 政令指定都市の区まで含める
    const kuMatch = cleaned.match(/^(.+?[市])(.*?区)/);
    if (kuMatch) {
      return kuMatch[1] + kuMatch[2]; // 例: "大阪市西区"
    }
    
    // 市町村抽出
    const cityMatch = cleaned.match(/^(.+?)(市|町|村)/);
    if (cityMatch) {
      return cityMatch[1] + cityMatch[2];
    }
    
    return null;
  },

  /**
   * 住所から座標を検索
   * CITY_HALL_COORDINATESから一致する市区町村を検索
   */
  findCoordinates(address) {
    if (!address || typeof CITY_HALL_COORDINATES === 'undefined') return null;

    // 1. 都道府県+市区町村で完全一致を試行
    const prefMatch = address.match(/^(北海道|東京都|大阪府|京都府|.{2,3}県)/);
    const pref = prefMatch ? prefMatch[1] : null;
    let remaining = pref ? address.substring(pref.length) : address;

    // 2. 政令指定都市の区で検索
    const kuMatch = remaining.match(/^(.+?市)(.+?区)/);
    if (kuMatch) {
      const fullKuName = kuMatch[1] + kuMatch[2]; // 例: "大阪市西区"
      if (CITY_HALL_COORDINATES[fullKuName]) {
        return { name: fullKuName, ...CITY_HALL_COORDINATES[fullKuName] };
      }
    }

    // 3. 市名で検索
    const cityMatch = remaining.match(/^(.+?)(市|町|村)/);
    if (cityMatch) {
      const cityName = cityMatch[1] + cityMatch[2];
      if (CITY_HALL_COORDINATES[cityName]) {
        return { name: cityName, ...CITY_HALL_COORDINATES[cityName] };
      }
    }

    // 4. 都道府県名で検索（例: "東京都" → "東京都"キー）
    if (pref && CITY_HALL_COORDINATES[pref]) {
      return { name: pref, ...CITY_HALL_COORDINATES[pref] };
    }

    // 5. 部分一致検索（住所に含まれる市区町村名を検索）
    for (const [name, coords] of Object.entries(CITY_HALL_COORDINATES)) {
      if (address.includes(name)) {
        return { name, ...coords };
      }
    }

    return null;
  },

  /**
   * 住所から距離・ランクを自動判定（メイン関数）
   * @returns { rank, label, distance, cityName, pref, regions } or { outOfRange: true }
   */
  determineAreaFromAddress(address) {
    const coords = this.findCoordinates(address);
    
    if (!coords) {
      return { 
        error: true, 
        message: '住所から座標を特定できませんでした。手動でエリアを選択してください。' 
      };
    }

    const distance = this.getDistanceFromOffice(coords.lat, coords.lng);
    const rankResult = this.getRankFromDistance(distance);

    if (!rankResult) {
      return {
        outOfRange: true,
        distance: Math.round(distance * 10) / 10,
        cityName: coords.name,
        pref: coords.pref,
        message: `本社からの直線距離: ${Math.round(distance)}km（500km超のためランク外です。フリー見積をご利用ください。）`
      };
    }

    return {
      rank: rankResult.rank,
      label: rankResult.label,
      distance: rankResult.distance,
      maxKm: rankResult.maxKm,
      regions: rankResult.regions,
      cityName: coords.name,
      pref: coords.pref,
      message: `${coords.name}（${coords.pref}） → 本社から直線 ${rankResult.distance}km → ${rankResult.label}`
    };
  },

  /**
   * テスト用: 主要都市の距離・ランク判定結果を表示
   */
  runTests() {
    const testCases = [
      '大阪府大阪市北区中之島',
      '大阪府堺市堺区',
      '兵庫県神戸市中央区',
      '京都府京都市中京区',
      '奈良県奈良市',
      '兵庫県姫路市',
      '滋賀県大津市',
      '和歌山県和歌山市',
      '三重県津市',
      '愛知県名古屋市中区',
      '岡山県岡山市北区',
      '広島県広島市中区',
      '山口県山口市',
      '福岡県福岡市博多区',
      '北海道札幌市中央区'
    ];

    console.log('=== 距離・ランク判定テスト ===');
    testCases.forEach(address => {
      const result = this.determineAreaFromAddress(address);
      if (result.error) {
        console.log(`❌ ${address}: ${result.message}`);
      } else if (result.outOfRange) {
        console.log(`🚫 ${address}: ${result.message}`);
      } else {
        console.log(`✅ ${address}: ${result.message}`);
      }
    });
  }
};

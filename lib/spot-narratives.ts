/**
 * スポット詳細ページに動的に生成する「編集部のコメント文」テキスト群。
 *
 * リメギフ手法 Tier 3 #7（スポット説明1000→3000字）の kyounoko 流移植。
 * Spot のリッチな構造化データ（category / ages / facilities / crowdLevel /
 * reservation / nearestStation など）から、編集部視点の自然文セクションを
 * 4つ生成して詳細ページのボリュームと情報密度を上げる。
 *
 * 各関数は対象データが揃っていない場合は null を返す。
 * ページ側では null を spread して section をスキップする。
 */
import type { Spot, SpotCategory, AgeTag } from './spots';
import { SPOT_CATEGORY_LABEL } from './spots';

const AGE_LABEL: Record<string, string> = {
  '0-1': '0〜1歳',
  '2-3': '2〜3歳',
  '4-6': '4〜6歳',
};

/** カテゴリ別「年齢別の楽しみ方」テンプレート */
const ENJOY_BY_AGE: Record<SpotCategory, Record<string, string>> = {
  zoo: {
    '0-1': 'ベビーカーで通れるルートを優先し、ヒツジ・ヤギなど小型動物の触れ合いコーナーを15〜30分目安に。授乳・お昼寝のリズムを優先して無理に園内を一周しないのが◎。',
    '2-3': '人気の動物（パンダ・ペンギン・ライオン）を先に押さえつつ、移動の合間に休憩ベンチで小休止。歩き疲れを想定して滞在2時間以内、ベビーカー併用が安心。',
    '4-6': 'マップを見ながら「絶対見たい動物ベスト3」を子どもと一緒に決めるとモチベ維持。エサやり・モルモット触れ合いなど体験系を組み込むと記憶に残る1日に。',
  },
  aquarium: {
    '0-1': '水槽の青い光に反応する月齢なので、暗めの大型水槽前で抱っこのままじっくり鑑賞するのが楽しめます。授乳室の位置を入場時に把握しておくと安心。',
    '2-3': 'タッチプール・イルカショーなど能動的な体験を中心に。ショーは長くて20分なので途中退席もOKの席（通路寄り）を選ぶと気が楽。',
    '4-6': '水族館は「学び」要素が強いので、家で生き物図鑑を読んでから行くと興味の質が変わります。ショー＋餌やり体験＋海の生き物クイズの3点セットがおすすめ。',
  },
  park: {
    '0-1': '芝生エリアで寝転んだり、滑り台の階段を一段ずつ上がるだけでも遊びになります。砂場道具を持参すると30分は集中して遊んでくれます。',
    '2-3': '滑り台・ブランコ・砂場の3点セットがあれば1時間は遊べます。お友達と並べる小さい遊具を選ぶと、社会性デビューの場としても◎。',
    '4-6': 'アスレチック・ターザンロープなど挑戦系の遊具で「できた！」を積み上げると自信に。広場でボール・縄跳びを持参すると遊びの幅が広がります。',
  },
  museum: {
    '0-1': '滞在は30分以内、ベビーカー利用必須。光と音の体験コーナーがあれば反応してくれます。',
    '2-3': '触れる展示・ボタンを押す展示があるエリア優先。「これ何？」攻撃には1つ深く答えるより、共感ベースで「ふしぎだね」と返すと疲れずに済みます。',
    '4-6': '学習目的の展示も理解できる年齢。事前に展示テーマをざっくり予告してから行くと「知ってる！」体験で吸収率が上がります。',
  },
  amusement: {
    '0-1': '0〜1歳が乗れる乗り物は限られるので、メリーゴーランド・観覧車を目的化。1〜2アトラクションで満足です。',
    '2-3': '身長制限90cm前後の乗り物が解禁になる年齢。事前に身長を計測しメモしておくと現地で乗り物選びがスムーズ。お昼寝休憩を組み込む前提で半日滞在が現実的。',
    '4-6': 'ジェットコースター系の身長110cm制限を超え始める時期。怖さの基準は個人差大なので、無理せず「楽しかった」で帰るのが鉄則。',
  },
  indoor: {
    '0-1': 'ハイハイ・伝い歩き専用エリアがある施設が安心。靴下持参の指定がある所が多いので確認を。',
    '2-3': 'ボールプール・ふわふわ遊具で全身を使う遊びが大満足。45分〜1時間で疲れて自然にお昼寝モードに入ります。',
    '4-6': 'アスレチック型の遊具で挑戦系の遊びを。同年代の子が多い時間帯（土日午後）は順番待ちが発生するので開店直後が狙い目。',
  },
  farm: {
    '0-1': '動物の匂い・大きな鳴き声に驚く可能性があるので、抱っこで様子を見ながら接近を。',
    '2-3': '搾乳・餌やり体験が体験ピーク。エサは追加購入する想定で予算を組むと安心です。',
    '4-6': '酪農の仕組み・命の循環の話まで深掘りできる年齢。アイス・チーズ作り体験があれば組み込むと学びの密度が上がります。',
  },
  seasonal: {
    '0-1': '体験時間は20〜30分が目安。気温・日差し対策を念入りに。',
    '2-3': '採れたものを「自分で選んだ」体験が記憶に残ります。袋を子ども用に1つ持たせると満足度が高い。',
    '4-6': '採取量の見極め・分類・お土産化まで一連の体験を任せると、食育・自然観察の効果も。',
  },
  restaurant: {
    '0-1': '離乳食持ち込みOKか、ベビーチェアの形状（リクライニング有無）を予約時に確認すると安心です。',
    '2-3': 'メニューを2〜3点に絞り、サクッと食べて切り上げる滞在60分以内のリズムが理想。',
    '4-6': '自分でメニューを選ぶ体験ができる年齢。キッズメニュー＋大人メニュー取り分けで満足度UP。',
  },
};

/** カテゴリ別の所要時間目安（滞在時間ガイドに使用） */
const TYPICAL_DURATION: Record<SpotCategory, string> = {
  zoo: '2〜3時間',
  aquarium: '1.5〜2.5時間',
  park: '1〜2時間',
  museum: '1〜1.5時間',
  amusement: '半日〜1日',
  indoor: '1〜1.5時間',
  farm: '2〜3時間',
  seasonal: '1〜1.5時間',
  restaurant: '60〜90分',
};

/**
 * 年齢別の楽しみ方ブロック。
 * spot.ages に含まれる年齢層ごとに、カテゴリ別テンプレートで生成。
 */
export function buildEnjoyByAgeBlocks(
  spot: Spot,
): Array<{ age: AgeTag; label: string; text: string }> {
  const template = ENJOY_BY_AGE[spot.category];
  const out: Array<{ age: AgeTag; label: string; text: string }> = [];
  for (const age of spot.ages) {
    // 施設ごとの上書き（admin編集）を最優先。無ければカテゴリ共通の自動文。
    const text = spot.ageGuide?.[age] ?? template?.[age];
    if (!text) continue;
    out.push({ age, label: AGE_LABEL[age] ?? age, text });
  }
  return out;
}

/**
 * 混雑回避のコツ。crowdLevel + reservation + hiddenTip から組成。
 * 何もデータがなければ null。
 */
export function buildCrowdAvoidanceText(spot: Spot): string | null {
  const parts: string[] = [];
  if (spot.crowdLevel?.holiday === 'high') {
    parts.push(
      '土日祝はピーク時間帯（11〜14時）が最も混雑するため、開園直後または15時以降の入場が比較的快適です。',
    );
  } else if (spot.crowdLevel?.holiday === 'mid') {
    parts.push(
      '土日祝はそれなりに賑わいますが、朝イチか午後遅めなら混雑のピークを外せます。',
    );
  } else if (spot.crowdLevel?.holiday === 'low') {
    parts.push('土日祝でも比較的空いており、どの時間帯でも快適に楽しめます。');
  }

  if (spot.crowdLevel?.weekday === 'low') {
    parts.push(
      '平日は終日空いている傾向。可能なら平日休みを取って訪問するのが最もストレスフリーです。',
    );
  } else if (spot.crowdLevel?.weekday === 'high') {
    parts.push(
      '平日でも午前中は混雑しがちなので、お昼以降の時間帯がおすすめです。',
    );
  }

  if (spot.reservation === 'required') {
    parts.push(
      '事前予約が必須のため、訪問日の数日前までに公式サイトで予約枠を確保しておきましょう。',
    );
  } else if (spot.reservation === 'recommended') {
    parts.push(
      '繁忙期は予約推奨。直前でも空きがあれば予約しておくと入場待ちのリスクを下げられます。',
    );
  }

  if (spot.hiddenTip) {
    parts.push(`編集部の現地メモ: ${spot.hiddenTip}`);
  }

  if (parts.length === 0) return null;
  return parts.join(' ');
}

/**
 * アクセスのポイント。最寄り駅・徒歩分数からおすすめの行き方を提案。
 */
export function buildAccessTipsText(spot: Spot): string | null {
  const parts: string[] = [];
  if (spot.nearestStation && spot.walkMinutes !== undefined) {
    if (spot.walkMinutes <= 5) {
      parts.push(
        `最寄り駅から徒歩${spot.walkMinutes}分と駅近なので、ベビーカー・電車派の家族に最も使いやすい立地です。`,
      );
    } else if (spot.walkMinutes <= 10) {
      parts.push(
        `最寄り駅から徒歩${spot.walkMinutes}分。ベビーカーでも問題なく通えますが、夏場・雨天時は時間に余裕を持って出発しましょう。`,
      );
    } else if (spot.walkMinutes <= 20) {
      parts.push(
        `最寄り駅から徒歩${spot.walkMinutes}分とやや距離があるため、抱っこ紐との併用やバス利用も検討すると楽です。`,
      );
    } else {
      parts.push(
        `最寄り駅から徒歩${spot.walkMinutes}分と距離があるので、車・タクシー・ベビーカーバスのいずれかを検討するのが現実的です。`,
      );
    }
  }
  if (spot.place === 'outdoor') {
    parts.push(
      '屋外施設のため、天気予報を前日にチェックし、暑さ・寒さ・雨対策の装備を整えてから出発しましょう。',
    );
  } else if (spot.place === 'indoor') {
    parts.push('屋内施設のため、急な天候変化があっても予定が崩れにくいのが利点です。');
  }
  const duration = TYPICAL_DURATION[spot.category];
  if (duration) {
    parts.push(`滞在の目安は${duration}。前後の移動を含めた1日のスケジュールを組むときの参考に。`);
  }
  if (parts.length === 0) return null;
  return parts.join(' ');
}

/**
 * 行く前に知っておきたい注意点。facilities の欠落点 + kidReport から組成。
 */
export function buildPreVisitNotes(spot: Spot): string | null {
  const parts: string[] = [];
  if (spot.facilities?.diaperChange === 'no') {
    parts.push(
      'おむつ替え台がない施設のため、近くのトイレや車内など代替スポットを事前に把握しておきましょう。',
    );
  }
  if (spot.facilities?.nursingRoom === 'no') {
    parts.push(
      '授乳室が用意されていないため、授乳ケープや、隣接施設の授乳室を利用する計画があると安心です。',
    );
  }
  if (spot.facilities?.bathroom === 'no') {
    parts.push(
      '館内トイレが限られている可能性があるので、来場前にトイレを済ませておくのがおすすめです。',
    );
  }
  if (spot.kidReport?.cautionNote) {
    parts.push(
      `編集部が実際に訪問した際の注意点: ${spot.kidReport.cautionNote}`,
    );
  }
  if (spot.budget === 'high') {
    parts.push(
      '入場料・体験料金が高めの施設なので、事前に公式の最新料金を確認し、家族予算と相談してから訪問しましょう。',
    );
  }
  if (parts.length === 0) return null;
  return parts.join(' ');
}

export type SpotFaq = { q: string; a: string };

/** 料金の目安（budget）を自然文に。 */
const BUDGET_TEXT: Record<NonNullable<Spot['budget']>, string> = {
  free: '無料',
  low: '1人あたり〜1,000円程度',
  mid: '1人あたり1,000〜3,000円程度',
  high: '1人あたり3,000円程度〜',
};

/**
 * よくある質問（FAQ）を Spot の構造化データから自動生成する。
 *
 * 既存のナレーション3種（混雑回避 / アクセス / 事前確認）が「読み物寄りの
 * まとまった解説」なのに対し、こちらは保護者が出発前に判断したい論点
 * （年齢・天気・料金・予約・ベビーカー・授乳設備・滞在時間）を一問一答で返す。
 * FAQPage 構造化データ（lib/spot-schema.ts の buildFaqJsonLd）と対になり、
 * AIO（AI Overview / ChatGPT 等）に引用されやすい形を狙う。
 *
 * 重複を避けるため、混雑・駅からの距離そのものは既存アコーディオンに任せ、
 * ここでは扱わない（ベビーカー可否のように切り口が異なるものだけ拾う）。
 *
 * 回答は確実に言えることだけを述べ、料金など鮮度が要るものは
 * 「公式サイトで確認」と必ず添える（住所/料金を断定しない運営方針に合わせる）。
 */
export function buildSpotFaqs(spot: Spot): SpotFaq[] {
  const faqs: SpotFaq[] = [];
  const cat = SPOT_CATEGORY_LABEL[spot.category] ?? 'スポット';
  const ages = spot.ages.map((a) => AGE_LABEL[a] ?? a).join('・');

  // 1. 対象年齢（ages は必ずある）
  if (spot.ages.length) {
    faqs.push({
      q: `${spot.name}は何歳ごろから楽しめますか？`,
      a:
        `${ages}のお子さんが特に楽しめる${cat}です。` +
        (spot.ages.includes('0-1')
          ? 'ねんね・ハイハイの赤ちゃん連れでも、ベビーカー動線や設備を確認しておけば一緒に過ごせます。'
          : '低年齢のうちは抱っこ紐があると移動が安心です。'),
    });
  }

  // 2. 雨の日（place は必ずある）
  faqs.push({
    q: '雨の日でも楽しめますか？',
    a:
      spot.place === 'indoor'
        ? '屋内施設なので、雨の日はもちろん猛暑や真冬でも天候を気にせず楽しめます。急な天気の変化で予定が崩れにくいのが魅力です。'
        : spot.place === 'mixed'
          ? '屋内と屋外の両方があり、雨の日は屋内エリアを中心に楽しめます。天気が不安な日でも訪れやすいスポットです。'
          : '屋外が中心のため、雨の日は楽しみにくくなります。お出かけ前に天気予報を確認し、無理のない範囲で計画しましょう。',
  });

  // 3. 料金
  if (spot.budget === 'free') {
    faqs.push({
      q: '入場料はかかりますか？',
      a: '基本的に無料で利用できます（一部の有料体験・駐車場などをのぞく）。最新の料金は公式サイトでご確認ください。',
    });
  } else {
    const pricingSummary = spot.pricing
      ? ([
          ['大人', spot.pricing.adult],
          ['小学生', spot.pricing.elementary],
          ['幼児', spot.pricing.preschool],
          ['乳児', spot.pricing.infant],
        ] as const)
          .filter(([, v]) => v)
          .map(([label, v]) => `${label}${v}`)
          .join('・')
      : '';
    const base = pricingSummary
      ? `料金の目安は${pricingSummary}です。`
      : spot.budget
        ? `料金の目安は${BUDGET_TEXT[spot.budget]}です。`
        : '';
    if (base) {
      faqs.push({
        q: '料金はどのくらいかかりますか？',
        a: `${base}正確な料金・割引・最新の改定は公式サイトでご確認ください。`,
      });
    }
  }

  // 4. 予約（指定がある時だけ）
  if (spot.reservation === 'required') {
    faqs.push({
      q: '予約は必要ですか？',
      a: '事前予約が必須です。訪問日が決まったら、早めに公式サイトで予約枠を確保しておきましょう。',
    });
  } else if (spot.reservation === 'recommended') {
    faqs.push({
      q: '予約は必要ですか？',
      a: '予約は必須ではありませんが、混雑する時期は事前に予約しておくと入場待ちを避けられます。',
    });
  } else if (spot.reservation === 'none') {
    faqs.push({
      q: '予約は必要ですか？',
      a: '予約なしで利用できます。ただし繁忙期は念のため、公式サイトの最新情報を確認してから出発すると安心です。',
    });
  }

  // 5. ベビーカー（手がかりがある時だけ）
  if (
    spot.facilities?.strollerRental === 'yes' ||
    spot.strollerAccess ||
    spot.walkMinutes !== undefined
  ) {
    const parts: string[] = [];
    if (spot.strollerAccess) parts.push('ベビーカーのまま入場・館内移動ができます。');
    if (spot.facilities?.strollerRental === 'yes') parts.push('ベビーカーの貸出もあります。');
    if (spot.walkMinutes !== undefined && spot.nearestStation) {
      parts.push(
        spot.walkMinutes <= 10
          ? `最寄り駅から徒歩${spot.walkMinutes}分とアクセスしやすい立地です。`
          : `最寄り駅から徒歩${spot.walkMinutes}分のため、抱っこ紐の併用やバス・車も検討すると移動が楽です。`,
      );
    }
    if (spot.place !== 'indoor') {
      parts.push('屋外には段差や砂利の場所もあるので、現地の動線は公式情報もあわせて確認してください。');
    }
    if (parts.length) {
      faqs.push({ q: 'ベビーカーで行っても大丈夫ですか？', a: parts.join(' ') });
    }
  }

  // 6. 授乳室・おむつ替え（どちらかが確認済みの時だけ）
  const nursing = spot.facilities?.nursingRoom;
  const diaper = spot.facilities?.diaperChange;
  if (nursing || diaper) {
    const bits: string[] = [];
    if (nursing === 'yes') bits.push('授乳室');
    if (diaper === 'yes') bits.push('おむつ替え台');
    let a: string;
    if (bits.length === 2) {
      a = '授乳室・おむつ替え台ともに用意されています。';
    } else if (bits.length === 1) {
      a = `${bits[0]}が用意されています。`;
      if (nursing === 'no') a += ' 授乳スペースはないため、授乳ケープや近隣施設の利用を想定しておくと安心です。';
      if (diaper === 'no') a += ' おむつ替え台はないため、代替の場所を事前に把握しておきましょう。';
    } else {
      // 両方 'no'
      a = '館内に授乳室・おむつ替え台は確認できていません。授乳ケープの持参や、近隣施設・車内での対応を想定しておくと安心です。';
    }
    if (spot.facilities?.note) a += ` （${spot.facilities.note}）`;
    faqs.push({ q: '授乳室やおむつ替えスペースはありますか？', a });
  }

  // 7. 滞在時間（カテゴリで必ず引ける）
  const duration = TYPICAL_DURATION[spot.category];
  if (duration) {
    faqs.push({
      q: '滞在時間はどのくらいみておけばいいですか？',
      a: `${spot.name}の滞在時間の目安は${duration}です。前後の移動や食事・お昼寝の時間も含めて、1日の予定を立てると無理なく楽しめます。`,
    });
  }

  return faqs;
}

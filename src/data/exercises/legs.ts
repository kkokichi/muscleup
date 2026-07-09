import type { Exercise } from "@/types";

export const LEG_EXERCISES: Exercise[] = [
  {
    id: "squat",
    categoryId: "legs",
    nameJa: "スクワット",
    nameEn: "Squat",
    youtubeUrl: "https://www.youtube.com/results?search_query=バーベルスクワット+フォーム+初心者",
    targetMuscles: ["大腿四頭筋", "臀筋", "ハムストリングス", "体幹"],
    equipment: "barbell",
    isCustom: false,
    howTo: [
      "バーを僧帽筋に担ぎ、足を肩幅に開く（つま先はやや外向き）",
      "胸を張ったまま、股関節と膝を同時に曲げてしゃがむ",
      "太ももが床と平行になる深さまで下りる",
      "かかとで床を押して立ち上がる",
    ],
    cautions: [
      "膝がつま先より内側に入らないように（ニーイン厳禁）",
      "背中を丸めない",
      "セーフティバーを必ず膝の少し上の高さにセット",
    ],
    beginnerTips: [
      "まずは自重スクワットで深さと軌道を習得",
      "しゃがむ深さは「平行」を目標に少しずつ",
      "かかと重心。つま先立ちにならないこと",
    ],
    commonMistakes: [
      "浅いスクワットで重量だけ追う",
      "膝が内側に入る",
      "お辞儀のように上体だけ倒れる（グッドモーニング化）",
    ],
  },
  {
    id: "leg-press",
    categoryId: "legs",
    nameJa: "レッグプレス",
    nameEn: "Leg Press",
    youtubeUrl: "https://www.youtube.com/results?search_query=レッグプレス+フォーム",
    targetMuscles: ["大腿四頭筋", "臀筋", "ハムストリングス"],
    equipment: "machine",
    isCustom: false,
    howTo: [
      "シートに深く座り、プレートに肩幅で足を置く",
      "安全バーを外し、膝が90度以下になるまで下ろす",
      "かかとで押し切る（膝はロックしない）",
      "コントロールしながら戻す",
    ],
    cautions: [
      "膝を伸ばし切ってロックしない",
      "深く下ろしすぎて腰がシートから浮かないように",
      "終了時は必ず安全バーを掛ける",
    ],
    beginnerTips: [
      "腰への負担が少なく、スクワットの導入に最適",
      "足を置く位置で効く部位が変わる（高め=お尻、低め=前もも）",
      "片脚ずつ行うと左右差の改善にも",
    ],
    commonMistakes: [
      "可動域が浅く「見栄の重量」になっている",
      "膝ロックで休みながら回数を稼ぐ",
      "腰が丸まるほど深く下ろす",
    ],
  },
  {
    id: "lunge",
    categoryId: "legs",
    nameJa: "ランジ",
    nameEn: "Lunge",
    youtubeUrl: "https://www.youtube.com/results?search_query=ランジ+フォーム+お尻",
    targetMuscles: ["臀筋", "大腿四頭筋", "ハムストリングス"],
    equipment: "dumbbell",
    isCustom: false,
    howTo: [
      "直立し、片脚を大きく一歩前に踏み出す",
      "両膝が90度になるまで腰を落とす",
      "前脚のかかとで床を押して戻る",
      "左右交互に繰り返す",
    ],
    cautions: [
      "前膝がつま先より大きく前に出ないように",
      "上体を倒しすぎない",
      "膝に痛みがある場合は歩幅を調整",
    ],
    beginnerTips: [
      "まずは自重で。慣れたらダンベルを両手に",
      "歩幅を大きくするとお尻に、小さくすると前ももに効く",
      "ふらつく場合は壁に手を添えてOK",
    ],
    commonMistakes: [
      "歩幅が狭く膝だけに負担がかかる",
      "上体が前に倒れてバランスを崩す",
      "後ろ膝を床にぶつける",
    ],
  },
  {
    id: "romanian-deadlift",
    categoryId: "legs",
    nameJa: "ルーマニアンデッドリフト",
    nameEn: "Romanian Deadlift",
    youtubeUrl:
      "https://www.youtube.com/results?search_query=ルーマニアンデッドリフト+フォーム",
    targetMuscles: ["ハムストリングス", "臀筋", "脊柱起立筋"],
    equipment: "barbell",
    isCustom: false,
    howTo: [
      "バーを持って直立し、膝を軽く曲げて固定",
      "お尻を後ろに引きながら、バーを脚に沿わせて下ろす",
      "ハムストリングスの伸びを感じたら（膝下あたり）",
      "お尻を前に突き出すように戻す",
    ],
    cautions: [
      "背中を絶対に丸めない",
      "床までつける必要はない（もも裏の伸びが限界点）",
      "バーを体から離さない",
    ],
    beginnerTips: [
      "「お尻を壁にタッチする」イメージで引く",
      "もも裏の柔軟性に合わせて可動域を決める",
      "通常のデッドリフトより軽めの重量で",
    ],
    commonMistakes: [
      "膝を曲げすぎて通常のデッドリフトになる",
      "背中が丸まる",
      "上体だけお辞儀してお尻が動いていない",
    ],
  },
];

import type { Exercise } from "@/types";

export const SHOULDER_EXERCISES: Exercise[] = [
  {
    id: "overhead-press",
    categoryId: "shoulders",
    nameJa: "オーバーヘッドプレス",
    nameEn: "Overhead Press",
    youtubeUrl:
      "https://www.youtube.com/results?search_query=オーバーヘッドプレス+フォーム",
    targetMuscles: ["三角筋前部・中部", "上腕三頭筋", "体幹"],
    muscles: ["front-delt", "side-delt", "triceps"],
    equipment: "barbell",
    isCustom: false,
    howTo: [
      "肩幅よりやや広めにバーを握り、鎖骨の高さに構える",
      "体幹とお尻を固めて直立する",
      "顔を少し引きながら、頭上へまっすぐ押し上げる",
      "バーが頭上を通過したら頭を戻し、ゆっくり下ろす",
    ],
    cautions: [
      "腰を反らせすぎない（肋骨を締める意識）",
      "バーの軌道は耳の横を通る直線に",
      "肩のウォームアップを必ず行う",
    ],
    beginnerTips: [
      "まずはバーのみ、または軽いダンベルで軌道を覚える",
      "お尻とお腹を固めると腰の反りを防げる",
      "押し切ったとき、バーの真下に頭が入る位置が正解",
    ],
    commonMistakes: [
      "腰を大きく反らせて胸で押す（インクライン化）",
      "バーが前に流れて肩の前だけに効く",
      "脚の反動を使ってしまう（それはプッシュプレス）",
    ],
  },
  {
    id: "dumbbell-shoulder-press",
    categoryId: "shoulders",
    nameJa: "ダンベルショルダープレス",
    nameEn: "Dumbbell Shoulder Press",
    youtubeUrl:
      "https://www.youtube.com/results?search_query=ダンベルショルダープレス+フォーム",
    targetMuscles: ["三角筋前部・中部", "上腕三頭筋"],
    muscles: ["front-delt", "side-delt", "triceps"],
    equipment: "dumbbell",
    isCustom: false,
    howTo: [
      "ベンチの背もたれを80〜90度にして座る",
      "ダンベルを耳の高さに構える（前腕は床と垂直）",
      "頭上へ弧を描くように押し上げる",
      "耳の高さまでコントロールして下ろす",
    ],
    cautions: [
      "下ろしすぎない（肘が肩より大きく下がると肩を痛めやすい）",
      "背中をシートから離して反らせない",
      "頂点でダンベルをぶつけない",
    ],
    beginnerTips: [
      "バーベルより軌道の自由度が高く、初心者にも扱いやすい",
      "スタート位置に上げるときは膝の反動を使ってOK",
      "10〜12回できる重さでフォーム優先",
    ],
    commonMistakes: [
      "腰を反らせて胸に効かせてしまう",
      "可動域が狭い（半分しか下ろさない）",
      "手首が外に倒れて負担がかかる",
    ],
  },
  {
    id: "side-lateral-raise",
    categoryId: "shoulders",
    nameJa: "サイドレイズ",
    nameEn: "Side Lateral Raise",
    youtubeUrl: "https://www.youtube.com/results?search_query=サイドレイズ+フォーム",
    targetMuscles: ["三角筋中部"],
    muscles: ["side-delt"],
    equipment: "dumbbell",
    isCustom: false,
    howTo: [
      "ダンベルを体の横に持ち、肘を軽く曲げる",
      "小指側からすくい上げるように真横へ上げる",
      "肩の高さまで上げたら一瞬止める",
      "重力に逆らいながらゆっくり下ろす",
    ],
    cautions: [
      "肩をすくめない（僧帽筋に逃げる）",
      "肩より高く上げる必要はない",
      "反動を使うなら最後の数回だけに",
    ],
    beginnerTips: [
      "軽い重量で高回数（15〜20回）が効きやすい種目",
      "「遠くに投げる」イメージで上げると三角筋に入る",
      "少し前傾すると僧帽筋の関与が減る",
    ],
    commonMistakes: [
      "重すぎて上体の反動で振り上げる",
      "肘が下がり前腕だけ上がる",
      "下ろしで脱力して負荷が抜ける",
    ],
  },
  {
    id: "rear-delt-fly",
    categoryId: "shoulders",
    nameJa: "リアデルトフライ",
    nameEn: "Rear Delt Fly",
    youtubeUrl: "https://www.youtube.com/results?search_query=リアデルトフライ+リアレイズ+フォーム",
    targetMuscles: ["三角筋後部", "僧帽筋中部"],
    muscles: ["rear-delt", "traps"],
    equipment: "dumbbell",
    isCustom: false,
    howTo: [
      "上体を45度以上前傾する（ベンチにうつ伏せでも可）",
      "肘を軽く曲げ、ダンベルを真下に構える",
      "弧を描くように真横へ開く",
      "肩甲骨を寄せすぎない位置で止め、ゆっくり戻す",
    ],
    cautions: [
      "反動で上体を起こさない",
      "首に力を入れない",
      "軽い重量でも十分効く種目。重量を追わない",
    ],
    beginnerTips: [
      "肩の後ろは意識しづらい部位。最初はとても軽い重量で",
      "「小指を天井へ」の意識で後部に入りやすい",
      "巻き肩・姿勢改善にも効果的",
    ],
    commonMistakes: [
      "肩甲骨を寄せて背中の種目になってしまう",
      "上体が起きてサイドレイズ化する",
      "振り回して可動域の端しか効いていない",
    ],
  },
];

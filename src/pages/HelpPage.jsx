import React from "react";
import {
  Coins,
  Sparkle,
  MessageCircle,
  Clock,
  Gift,
} from "lucide-react";

const Section = ({ icon, title, children }) => (
  <section className="mb-10 animate-fade-in-up">
    <div className="flex items-center space-x-2 mb-3">
      <div className="text-teal-600">{icon}</div>
      <h2 className="text-xl font-bold">{title}</h2>
    </div>
    {children}
  </section>
);

const Box = ({ color = "gray", children }) => {
  const colors = {
    teal: "bg-teal-50 border-teal-200",
    yellow: "bg-yellow-50 border-yellow-200",
    rose: "bg-rose-50 border-rose-200",
    gray: "bg-gray-50 border-gray-200",
  };
  return (
    <div className={`border rounded-lg p-5 ${colors[color]}`}>{children}</div>
  );
};

const HelpPage = () => (
  <div className="max-w-3xl mx-auto pt-24 px-4">
    <h1 className="text-2xl md:text-3xl font-extrabold text-center mb-2">
      アプリの使い方ガイド
    </h1>
    <p className="text-center text-gray-600 mb-12">
      QUSISピッチ応援プラットフォームの使い方とQUcoinの活用方法
    </p>

    {/* --- QUcoin とは --------------------- */}
    <Section icon={<Coins className="w-6 h-6" />} title="QUcoinとは">
      <Box color="gray">
        <p className="text-gray-700 mb-4">
          QUcoinは、ピッチイベントで使用される仮想通貨です。観覧者がプレゼンターを応援するための
          ギフトとして使用できます。
        </p>

        <Box color="yellow">
          <div className="flex items-start space-x-2">
            <Sparkle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <p className="text-sm">
              <span className="font-semibold">新規登録ボーナス</span>
              <br />
              アカウント作成時に<strong>500 QUcoin</strong>をプレゼント！
            </p>
          </div>
        </Box>
      </Box>
    </Section>

    {/* --- 獲得方法 ------------------------ */}
    <Section
      icon={<MessageCircle className="w-6 h-6" />}
      title="QUcoinの獲得方法"
    >
      <Box color="gray">
        <div className="grid gap-6 md:grid-cols-2">
          {/* チャット投稿 */}
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-teal-100 rounded-lg">
              <MessageCircle className="w-6 h-6 text-teal-600" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">チャット投稿</h3>
              <p className="text-sm text-gray-600">
                イベントのチャットにメッセージを投稿すると
                <strong>20 QUcoin</strong>獲得
              </p>
            </div>
          </div>

          {/* 時間貢献 */}
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">QUSISへの貢献</h3>
              <p className="text-sm text-gray-600">
                QUSISが主催するイベントの参加、ヒアリングなどの活動を申請しコインを獲得
              </p>
            </div>
          </div>
        </div>
      </Box>
    </Section>

    {/* --- 使い方 -------------------------- */}
    <Section icon={<Gift className="w-6 h-6" />} title="QUcoinの使い方">
      <Box color="rose" className="mb-4">
        <p>
          <span className="font-bold">投げ銭</span><br />
          気に入ったピッチプレゼンテーションに対してQUcoinで投げ銭ができます。
        </p>
      </Box>

      <Box color="yellow">
        <h4 className="font-semibold mb-2">重要なルール</h4>
        <ul className="list-disc list-inside text-sm space-y-1">
          <li>自分のチームのピッチには投げ銭を送信できません</li>
          <li>送信した投げ銭は取り消しできません</li>
        </ul>
      </Box>
    </Section>

    {/* --- ステップバイステップガイド ----- */}
    <Section title="ステップバイステップガイド" icon={<></>}>
      <Box color="gray">
        {[
          "イベントに参加 - ホームページからライブ中のピッチイベントを選択して参加します",
          "チャットで交流 - メッセージを投稿してコインを獲得し、他の参加者と交流します",
          "投げ銭を送信 - 気に入ったプレゼンテーションにQUcoinで投げ銭して応援します",
          "履歴を確認・コインをさらに獲得 - ページ右上の「コインを増やす」ボタンからコインの獲得や使用履歴の確認ができます",
        ].map((text, idx) => (
          <div key={idx} className="flex items-start space-x-3 mb-4 last:mb-0">
            <div className="w-7 h-7 rounded-full bg-teal-600 text-white flex items-center justify-center text-sm font-bold">
              {idx + 1}
            </div>
            <p className="text-sm text-gray-700">{text}</p>
          </div>
        ))}
      </Box>
    </Section>
  </div>
);

export default HelpPage;

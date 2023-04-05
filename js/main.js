'use strict';

const input = document.getElementById('input');
const button = document.getElementById('search');
const arrangeList = document.getElementById('arrangeList');
const errorText = document.getElementById('error');
const reset = document.getElementById('reset');
const items = document.querySelectorAll('.items');

let checkout = 0;


// ボード内の得点を全て入れる
const boardNumber = [];

// Single Number
for (let i = 0; i <= 20; i++) {
    boardNumber.push(i);
}
// Double Number
for (let i = 2; i <= 40; i++) {
    if (i % 2 === 0) {
        boardNumber.push(i);
    }
}
// Triple Number
for (let i = 3; i <= 60; i++) {
    if (i % 3 === 0) {
        boardNumber.push(i);
    }
}

/**
 * アレンジの数値を取得できたら
 * 下部に上がりパターンを出す
 */
const task = (value) => {
    return new Promise((resolve, reject) => {
        resolve(value);
    });
};

/**
 * バリデーション
 * 数字のみ許容
 * 3桁以上はエラー
 */
const validation = (value) => {
    // 正規表現
    const regex = /^[0-9]{1,3}$/;

    if (!errorText.innerText) {
        errorText.insertAdjacentHTML('afterbegin', `※アレンジ番号を半角数字3桁で入力してください`);
    }

    // 半角数字3桁ではない、または、値が入力されていなければerror
    return regex.test(Number(value)) === false || value === 0 ? 'error' : 'ok';
};


/**
 * アレンジ検索の処理
 */
button.addEventListener('click', () => {
    checkout = Number(input.value);

    if (validation(checkout) === 'error') {
        alert('アレンジ番号を半角数字3桁で入力してください');
    } else {

        errorText.innerText = null;
        button.classList.add('none');
        button.disabled = "disabled";

        task(checkout).then(checkout => {

            /**
             * 1~60を[a, b, c]型の配列にして様々な並びパターンを作成
             */
            const permutation = (arr, number) => {
                let ans = [];
                if (number === 1) {
                    for (let i = 0; i < arr.length; i++) {
                        ans[i] = [arr[i]];
                    }
                } else {
                    for (let i = 0; i < arr.length; i++) {
                        let parts = arr.slice(0);
                        // 数字被りも含め全てのパターンを取り出す
                        parts.splice(i, 0)[0];
                        let row = permutation(parts, number - 1);
                        for (let j = 0; j < row.length; j++) {
                            // 数値を結合して配列にする
                            ans.push([arr[i]].concat(row[j]));
                        }
                    }
                }
                return ans;
            }

            const pattern = permutation(boardNumber, 3);

            /**
             * 数値が大きい順に並び変える
             */
            const sortFunc = (a, b) => {
                return b - a;
            }

            let arrange = [];
            for (let i = 0; i < pattern.length; i++) {
                const a = pattern[i][0];
                const b = pattern[i][1];
                const c = pattern[i][2];

                // 合計値がcheckout値になる配列のみを抽出
                if (a + b + c === checkout) {
                    // 配列内の数値を降順にして並びを整形
                    let arr = [a, b, c].sort(sortFunc);
                    arrange.push(arr);
                }
            }


            /**
             * arrange内の重複した配列を削除する
             * 1. new Set: 重複を削除しオブジェクトを返す
             * 2. Array.from(): オブジェクトを配列(array)へ変換
             * 3. JSON.stringify: オブジェクトをJSON化し文字列に変換
             * 4. JSON.parse: JSONをJSオブジェクトへ変換
             */
            arrange = Array.from(new Set(arrange.map(JSON.stringify))).map(JSON.parse);
            if (arrange.length === 0) {
                alert('アレンジがありません');
            }


            /**
             * トリプルナンバーなら「Txx」
             * ダブルナンバーなら「Dxx」
             * と出力させる
             **/
            const decision = (points) => {
                if (points % 3 === 0 && points != 0) {
                    return `T${points / 3}`;
                } else if (points % 2 === 0 && points != 0) {
                    return `D${points / 2}`;
                } else if (points === 0) {
                    return '';
                } else {
                    return `S${points}`;
                }
            };

            arrange.map((index, value) => {
                let TD;
                let pointNum;

                // 1スローで終わる場合
                if (index[1] === 0 && index[2] === 0) {
                    TD = `${decision(index[0])}`;
                    pointNum = `${index[0]}`;

                    // 2スローで終わる場合
                } else if (index[2] === 0) {
                    TD = `${decision(index[0])}, ${decision(index[1])}`;
                    pointNum = `${index[0]}, ${index[1]}`;

                    // 3スローで終わる場合
                } else {
                    TD = `${decision(index[0])}, ${decision(index[1])}, ${decision(index[2])}`;
                    pointNum = `${index[0]}, ${index[1]}, ${index[2]}`;
                }

                arrangeList.insertAdjacentHTML('afterbegin', `
                    <div id='num${value}' class='${value % 2 === 0 ? "even" : "odd"} items'>
                        ${TD}
                        <span class='pointNum'>
                            ${pointNum}
                        </span>
                    </div>
                `);
            });

        }).catch(error => {
            error.error('失敗しました。');
        });
    }
});


/**
 * リセットで下部の要素を削除
 */
reset.addEventListener('click', () => {
    // 記入内容をリセット
    checkout = 0;
    input.value = null;
    button.disabled = null;
    button.classList.remove('none');

    while (arrangeList.firstChild) {
        arrangeList.removeChild(arrangeList.firstChild);
    }
    
});
const saveData = {
    id: 2867,
    fields: [
        {
            filedName: 'title ',
            text: 'M6 Labs Crypto Market Pulse: You’re Not Bullish Enough On ETH',
            output: '',
            status: 'PENDING',
        },
        {
            filedName: 'content ',
            text: '<p>CoinTracking: Your Top Choice for Crypto Taxes in the US</p><p>&nbsp;</p><p><a href="https://cointracking.info/?ref=CBUREAU"><i>CoinTracking</i></a><i> is the most complete crypto tax tool in the market with 1.5 million users, helping US investors comply with all the changing requirements.</i></p><p>&nbsp;</p><p><i>Why CoinTracking excels in crypto taxation</i></p><p>&nbsp;</p><p><a href="https://cointracking.info/?ref=CBUREAU">CoinTracking</a> has been on the market since 2013, one of the first tax software specifically designed to help crypto investors across countries, including the US.</p><p>&nbsp;</p><p>Since then, the crypto market has evolved a lot, but CoinTracking has consistently been the most complete tax software, given its existence since the inception of the crypto market!</p><p>&nbsp;</p><p>US investors will find all the features they need to do their crypto taxes with CoinTracking, from<a href="https://cointracking.info/enter_coins.php/?ref=CBUREAU">&nbsp;importing crypto trades</a> from hundreds of exchanges, blockchains and wallets, to generating the necessary<a href="https://cointracking.info/tax/?ref=CBUREAU">&nbsp;tax reports</a>.</p><p><br>&nbsp;</p>',
            output: '',
            status: 'PENDING',
        },
        {
            filedName: 'editors_note ',
            text: '<p>Want to cut right to the chase and start buying Bitcoin? <a target="_blank" rel="noopener nofollow"><u>eToro</u></a> and <a target="_blank" rel="noopener nofollow"><u>Uphold</u></a> are solid and reputable platforms for buying and trading Bitcoin in the UK.</p>',
            output: '',
            status: 'PENDING',
        },
    ],
    status: 'PENDING',
    locale: 'en',
};
const transformData = (comingData) => {
    return {
        id: comingData.id,
        fields: [
            {
                filedName: 'title',
                text: comingData.title,
                output: '',
                status: 'PENDING',
            },
            {
                filedName: 'content',
                text: comingData.content,
                output: '',
                status: 'PENDING',
            },
            {
                filedName: 'editors_note',
                text: comingData.editors_note,
                output: '',
                status: 'PENDING',
            },
        ],
        status: 'PENDING',
        locale: comingData.blog_category.locale,
    };
};
const comingData = {
    id: 2867,
    title: 'M6 Labs Crypto Market Pulse: You’re Not Bullish Enough On ETH',
    content: '<p>CoinTracking: Your Top Choice for Crypto Taxes in the US</p><p>&nbsp;</p><p><a href="https://cointracking.info/?ref=CBUREAU"><i>CoinTracking</i></a><i> is the most complete crypto tax tool in the market with 1.5 million users, helping US investors comply with all the changing requirements.</i></p><p>&nbsp;</p><p><i>Why CoinTracking excels in crypto taxation</i></p><p>&nbsp;</p><p><a href="https://cointracking.info/?ref=CBUREAU">CoinTracking</a> has been on the market since 2013, one of the first tax software specifically designed to help crypto investors across countries, including the US.</p><p>&nbsp;</p><p>Since then, the crypto market has evolved a lot, but CoinTracking has consistently been the most complete tax software, given its existence since the inception of the crypto market!</p><p>&nbsp;</p><p>US investors will find all the features they need to do their crypto taxes with CoinTracking, from<a href="https://cointracking.info/enter_coins.php/?ref=CBUREAU">&nbsp;importing crypto trades</a> from hundreds of exchanges, blockchains and wallets, to generating the necessary<a href="https://cointracking.info/tax/?ref=CBUREAU">&nbsp;tax reports</a>.</p><p><br>&nbsp;</p>',
    editors_note: '<p>Want to cut right to the chase and start buying Bitcoin? <a target="_blank" rel="noopener nofollow"><u>eToro</u></a> and <a target="_blank" rel="noopener nofollow"><u>Uphold</u></a> are solid and reputable platforms for buying and trading Bitcoin in the UK.</p>',
    blog_category: {
        id: 6,
        name: 'Guest Post',
        slug: 'guest-post',
        description: "Archive of the Coin Bureau's articles and content around crypto Guest posts.",
        createdAt: '2022-12-01T23:10:41.226Z',
        updatedAt: '2023-04-09T10:55:31.067Z',
        publishedAt: '2022-12-01T23:10:43.172Z',
        locale: 'en',
        search_rank: null,
    },
    seo: {
        id: 8274,
        seo_title: 'M6 Labs Crypto Market Pulse: You’re Not Bullish Enough On ETH',
        seo_description: "In this week's report by M6 Labs the team covers airdrops, Dencun, LRTs, blue chips, AI projects, gaming and more!",
        seo_robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1, NOODP, NOYDIR',
        canonical: null,
        og_type: 'article',
        twitter_card: 'summary_large_image',
        keywords: 'crypto news, bitcoin, gaming news, airdrops, dencun, crypto report, crypto analysis',
        seo_thumbnail: null,
        meta_social: [],
        video_structured_data: null,
    },
};
const savedData = transformData(comingData);
console.log(savedData);
//# sourceMappingURL=test.js.map
import {DataFrame} from "pandas-js";


class Analyzer {
    constructor(rawTextFile) {
        this.rawTextFile = rawTextFile;
        this.startDate = null;
        this.endDate = null;
        /////////////////////////METRICS (SENDER ONE)/////////////////////////
        this.sOne = null;
        this.dfOne = null;
        this.sOneMsgCount = null;
        this.sOneWordCount = null;
        this.sOneWPMCount = null;
        this.sOneMediaCount = null;
        this.sOneMsgComment = null;
        this.sOneWordComment = null;
        this.sOneWPMComment = null;
        this.sOneMediaComment = null;
        this.sOneAverageRTComment = null;
        this.sOneDatetimes = null;
        this.sOneTimings = null;
        this.sOneAverageRT = null;

        /////////////////////////METRICS (SENDER TWO)/////////////////////////
        this.sTwo = null;
        this.dfTwo = null;
        this.sTwoMsgCount = null;
        this.sTwoWordCount = null;
        this.sTwoWPMCount = null;
        this.sTwoMediaCount = null;
        this.sTwoMsgComment = null;
        this.sTwoWordComment = null;
        this.sTwoWPMComment = null;
        this.sTwoMediaComment = null;
        this.sTwoAverageRTComment = null;
        this.sTwoDatetimes = null;
        this.sTwoTimings = null;
        this.sTwoAverageRT = null;
    }

    startPipeline = async () => {
        const messageArray = await this.parseRawTextFile(this.rawTextFile)
        const messageDF = this.createDF(messageArray);
        this.generateMetrics(messageDF);
        this.generateComments();
    };

    parseRawTextFile = async (rawTextFile) => {
        const textFileParser = require('whatsapp-chat-parser');
        return await textFileParser.parseString(rawTextFile);
    };

    createDF = messageArray => {
        // SETUP 2D ARRAY TO HOLD THE ROWS OF THE DF
        const rows = [];

        // POPULATE THESE ROWS
        for (let i = 0, len = messageArray.length; i < len; i++) {
            if (messageArray[i].author !== "System") {
                rows.push([messageArray[i].date, messageArray[i].author, messageArray[i].message]);
            }
        }

        // CREATE THE PANDAS DF
        let messageDF = new DataFrame(rows);
        messageDF.columns = ["datetime", "sender", "message"];

        // CLEAN THE DF
        messageDF = messageDF.filter(messageDF.get("datetime").notnull());
        messageDF = messageDF.filter(messageDF.get("sender").notnull());
        messageDF = messageDF.filter(messageDF.get("message").notnull());
        return messageDF;
    };

    computeAvg = (arr, dp = 1) => {
        return parseFloat(
            ((arr => arr.reduce((a, b) => a + b, 0))(arr) / arr.length).toFixed(dp)
        );
    };

    filterDatetimes = (
        datetimes,
        timings,
        CUTOFF_MIN_HOURS = 0.016666, // IE. 1 MINUTE
        CUTOFF_MAX_HOURS = 168 // IE. 7 DAYS
    ) => {
        const datetimes_filtered = [];
        const timings_filtered = [];
        for (let i = 0; i < datetimes.length; i++) {
            if (timings[i] >= CUTOFF_MIN_HOURS && timings[i] <= CUTOFF_MAX_HOURS) {
                datetimes_filtered.push(datetimes[i]);
                timings_filtered.push(timings[i]);
            }
        }
        return [datetimes_filtered, timings_filtered];
    };

    generateMetrics = df => {
        // SENDERS
        this.sOne = df
            .get("sender")
            .unique()
            .toArray()
            .sort()[0];
        this.sTwo = df
            .get("sender")
            .unique()
            .toArray()
            .sort()[1];


        // DF SEPARATED BY SENDER
        this.dfOne = df
            .filter(df.get("sender").eq(this.sOne))
            .reset_index({drop: true});
        this.dfTwo = df
            .filter(df.get("sender").eq(this.sTwo))
            .reset_index({drop: true});

        // GET METRICS FOR EACH SENDER
        [
            this.sOneMsgCount,
            this.sOneWordCount,
            this.sOneWPMCount,
            this.sOneMediaCount,
        ] = this.generateCount(this.dfOne);
        [
            this.sTwoMsgCount,
            this.sTwoWordCount,
            this.sTwoWPMCount,
            this.sTwoMediaCount,
        ] = this.generateCount(this.dfTwo);


        // REPLY TIMING COUNT AND THEIR AVERAGE
        const TDDict = this.generateReplyTimings(df);
        this.sOneTimings = TDDict[this.sOne][0];
        this.sOneDatetimes = TDDict[this.sOne][1];
        this.sTwoTimings = TDDict[this.sTwo][0];
        this.sTwoDatetimes = TDDict[this.sTwo][1];


        // FILTER REPLY TIMINGS
        [this.sOneDatetimes, this.sOneTimings] = this.filterDatetimes(
            this.sOneDatetimes,
            this.sOneTimings
        );
        [this.sTwoDatetimes, this.sTwoTimings] = this.filterDatetimes(
            this.sTwoDatetimes,
            this.sTwoTimings
        );

        // COMPUTE AVERAGE REPLY TIMINGS
        this.sOneAverageRT = this.computeAvg(this.sOneTimings);
        this.sTwoAverageRT = this.computeAvg(this.sTwoTimings);

        // START AND END DATE OF CONVERSATION
        this.startDate = new Date(
            Math.min(this.sOneDatetimes[0], this.sTwoDatetimes[0])
        ).toDateString();
        this.endDate = new Date(
            Math.max(
                this.sOneDatetimes[this.sOneDatetimes.length - 1],
                this.sTwoDatetimes[this.sTwoDatetimes.length - 1]
            )
        ).toDateString();
    };

    generateCount = senderDf => {
        // 1. MESSAGE COUNT
        const senderMsgCount = senderDf.length;

        // 2. WORD COUNT
        const senderWordCount = senderDf
            .get("message")
            .map(c => c.split(" ").length)
            .sum();

        // 3. WPM COUNT
        const senderWPMCount = parseFloat(
            (senderWordCount / senderMsgCount).toFixed(1)
        );

        // 4. MEDIA COUNT
        const senderMediaCount = senderDf.filter(
            senderDf.get("message").eq("<Media omitted>")
        ).length;

        // RETURN ALL METRICS
        return [
            senderMsgCount,
            senderWordCount,
            senderWPMCount,
            senderMediaCount,
        ];
    };

    generateReplyTimings = df => {
        // GET COLUMN NAMES
        const dfCols = df.columns;
        const colLength = dfCols.toArray().length;

        // DROP ALL DUPLICATES ALONG ROLLING WINDOW
        const rowSubset = [df.iloc(0, [0, colLength]).values.toArray()[0].toArray()];

        // TODO : GENERATE NEW WAY OF LOOPING
        for (let i=1, sender=df.get('sender'), len=sender.length; i<len; i++) {
            if (sender.iloc(i) !== sender.iloc(i - 1)) {
                rowSubset.push(df.iloc(i, [0, colLength]).values.toArray()[0].toArray());
            }
        }

        df = new DataFrame(rowSubset);
        df.columns = dfCols.toArray();


        // GET THE RESPECTIVE SENDERS
        const sOne = df.get("sender").iloc(0);
        const sTwo = df.get("sender").iloc(1);


        // SET THE REPLY TIMINGS COLUMN
        df = df.set(
            "reply_timing",
            df
                .get("datetime")
                .diff()
                .div(1000 * 3600) // MS TO HOURS
        );

        // GET THE RESPECTIVE REPLY DATAFRAMES
        const dfOne = df.filter(df.get("sender").eq(sOne));
        const dfTwo = df.filter(df.get("sender").eq(sTwo));

        return {
            [sOne]: [
                dfOne.get("reply_timing").values.toArray(),
                dfOne.get("datetime").values.toArray()
            ],
            [sTwo]: [
                dfTwo.get("reply_timing").values.toArray(),
                dfTwo.get("datetime").values.toArray()
            ]
        };
    };

    generateMessageComments = () => {
        const MIN = Math.min(this.sOneMsgCount, this.sTwoMsgCount);
        const MAX = Math.max(this.sOneMsgCount, this.sTwoMsgCount);
        const DIFF = MAX - MIN;
        const MESSAGE_LOW = sender =>
            `On average, ${sender} sends 🥈${parseInt(
                (DIFF / MAX) * 100
            )}% fewer🥈 messages.`;
        const MESSAGE_HIGH = sender =>
            `On average, ${sender} sends 🥇${parseInt(
                (DIFF / MIN) * 100
            )}% more🥇 messages.`;
        this.sOneMsgComment =
            this.sOneMsgCount >= this.sTwoMsgCount
                ? MESSAGE_HIGH(this.sOne)
                : MESSAGE_LOW(this.sOne);
        this.sTwoMsgComment =
            this.sTwoMsgCount >= this.sOneMsgCount
                ? MESSAGE_HIGH(this.sTwo)
                : MESSAGE_LOW(this.sTwo);
    };

    generateWordComments = () => {
        const MIN = Math.min(this.sOneWordCount, this.sTwoWordCount);
        const MAX = Math.max(this.sOneWordCount, this.sTwoWordCount);
        const DIFF = MAX - MIN;
        const WORD_LOW = sender =>
            `${sender}, the quieter one in this conversation... by ${parseInt(
                (DIFF / MAX) * 100
            )}%! 🙂`;
        const WORD_HIGH = sender =>
            `Quite a chatty one aren't you, ${sender}! 😉 On average, you were ${parseInt(
                (DIFF / MIN) * 100
            )}% as... verbose!`;
        this.sOneWordComment =
            this.sOneWordCount >= this.sTwoWordCount
                ? WORD_HIGH(this.sOne)
                : WORD_LOW(this.sOne);
        this.sTwoWordComment =
            this.sTwoWordCount >= this.sOneWordCount
                ? WORD_HIGH(this.sTwo)
                : WORD_LOW(this.sTwo);
    };

    generateWPMComments = () => {
        const MIN = Math.min(this.sOneWPMCount, this.sTwoWPMCount);
        const MAX = Math.max(this.sOneWPMCount, this.sTwoWPMCount);
        const DIFF = MAX - MIN;
        const WPM_LOW = sender =>
            `Obviously the quieter one, ${sender}! 😉 On average, your texts are ${parseInt(
                (DIFF / MAX) * 100
            )}% shorter.`;
        const WPM_HIGH = sender =>
            `Quite a chatty one aren't you, ${sender}! 😉 On average, your texts are ${parseInt(
                (DIFF / MIN) * 100
            )}% longer.`;
        this.sOneWPMComment =
            this.sOneWPMCount >= this.sTwoWPMCount
                ? WPM_HIGH(this.sOne)
                : WPM_LOW(this.sOne);
        this.sTwoWPMComment =
            this.sTwoWPMCount >= this.sOneWPMCount
                ? WPM_HIGH(this.sTwo)
                : WPM_LOW(this.sTwo);
    };

    generateMediaComments = () => {
        const MIN = Math.min(this.sOneMediaCount, this.sTwoMediaCount);
        const MAX = Math.max(this.sOneMediaCount, this.sTwoMediaCount);
        const DIFF = MAX - MIN;
        const MEDIA_LOW = sender =>
            `Perhaps words suit you better, ${sender}! 😉 On average, you sent ${parseInt(
                (DIFF / MAX) * 100
            )}% fewer photos, videos, and stickers!`;
        const MEDIA_HIGH = sender =>
            `Maybe you express yourself better with 📸📸📸, ${sender}? On average, you sent ${parseInt(
                (DIFF / MIN) * 100
            )}% more photos, videos, and stickers!`;
        this.sOneMediaComment =
            this.sOneMediaCount >= this.sTwoMediaCount
                ? MEDIA_HIGH(this.sOne)
                : MEDIA_LOW(this.sOne);
        this.sTwoMediaComment =
            this.sTwoMediaCount >= this.sOneMediaCount
                ? MEDIA_HIGH(this.sTwo)
                : MEDIA_LOW(this.sTwo);
    };


    generateAverageRTComments = () => {
        const MIN = Math.min(this.sOneAverageRT, this.sTwoAverageRT);
        const MAX = Math.max(this.sOneAverageRT, this.sTwoAverageRT);
        const DIFF = MAX - MIN;
        const AVERAGE_RT_LOW = sender =>
            `Always on your phone, I see, ${sender}! 🤓 On average, you are ${parseInt(
                (DIFF / MAX) * 100
            )}% quicker to respond!`;
        const AVERAGE_RT_HIGH = sender =>
            `Quite the busy one, ${sender}! 😎 On average, you take ${parseInt(
                (DIFF / MIN) * 100
            )}% longer to return your texts!`;
        this.sOneAverageRTComment =
            this.sOneAverageRT >= this.sTwoAverageRT
                ? AVERAGE_RT_HIGH(this.sOne)
                : AVERAGE_RT_LOW(this.sOne);
        this.sTwoAverageRTComment =
            this.sTwoAverageRT >= this.sOneAverageRT
                ? AVERAGE_RT_HIGH(this.sTwo)
                : AVERAGE_RT_LOW(this.sTwo);
    };

    generateComments = () => {
        this.generateMessageComments();
        this.generateWordComments();
        this.generateWPMComments();
        this.generateMediaComments();
        this.generateAverageRTComments();
    };
}

export default Analyzer;

const {HtmlTelegramBot, userInfoToString} = require("./bot");
const ChatGptService = require("./gpt");

class MyTelegramBot extends HtmlTelegramBot {
    constructor(token) {
        super(token);
        this.mode = null;
        this.list = []
        this.user = {}
        this.count = 0
    }

    async start(msg) {
        this.mode = "main"
        const text = this.loadMessage("main")
        await this.sendImage("main");
        await this.sendText(text);

        await this.showMainMenu({
            "start": "главное меню бота",
            "profile": "генерация Tinder-профиля 😎",
            "opener": "сообщение для знакомства 🥰",
            "message": "переписка от вашего имени 😈",
            "date": "переписка со звездами 🔥",
            "gpt": "задать вопрос чату GPT 🧠",
            "html": "демонстрация HTML"
        })
    }

    async html(msg) {
        await this.sendHTML('<h3 style="color: antiquewhite">Привет!</h3>')
        const html = this.loadHtml("main")
        await this.sendHTML(html, {theme: "dark"})
    }

    async gpt(msg) {
        this.mode = "gpt"
        const text = this.loadMessage("gpt")
        await this.sendImage("gpt");
        await this.sendText(text);
    }

    async gptDialog(msg) {
        const text = msg.text;
        const myMessage = await this.sendText("ChatGPT думает над вариантами ответа...")
        const prompt = this.loadPrompt("gpt")
        const answer = await chatGpt.sendQuestion("Ответь на вопрос", text)
        await bot.editText(myMessage, answer)
    }

    async date(msg) {
        this.mode = "date"
        const text = this.loadMessage("date")
        await this.sendImage("date");
        await this.sendTextButtons(text, {
            "date_grande": "Ариана Гранде",
            "date_robbie": "Марго Робби",
            "date_zendaya": "Зендея",
            "date_gosling": "Райан Гослинг",
            "date_hardy": "Том Харди"
        });
    }

    async dateButtons(callBackQuery) {
        const query = callBackQuery.data;
        await this.sendImage(query);
        const prompt = this.loadPrompt(query)
        chatGpt.setPrompt(prompt)
    }

    async dateDialog(msg) {
        const text = msg.text;
        const myMessage = await this.sendText("Девушка набирает текст...")
        const answer = await chatGpt.addMessage(text)
        await this.editText(myMessage, answer)
    }

    async message(msg) {
        this.mode = "message"
        const text = this.loadMessage("message")
        await this.sendImage("message");
        await this.sendTextButtons(text, {
            "message_next": "Следующее сообщение",
            "message_date": "Пригласить на свидание"
        });
    }

    async messageButtons(callBackQuery) {
        const query = callBackQuery.data;
        const prompt = this.loadPrompt(query)
        const userChatHistory = this.list.join("\n\n")

        const myMessage = await this.sendText("ChatGPT думает над вариантами ответа...")
        const answer = await chatGpt.sendQuestion(prompt, userChatHistory)
        await this.editText(myMessage, answer)
    }

    async messageDialog(msg) {
        const text = msg.text;
        this.list.push(text)
    }

    async profile(msg) {
        this.mode = "profile"
        const text = this.loadMessage("profile")
        await this.sendImage("profile");
        await this.sendText(text);

        this.user = {}
        this.count = 0
        await this.sendText("Сколько Вам лет?")
    }


    async profileDialog(msg) {
        const text = msg.text;
        this.count++
        if (this.count === 1) {
            this.user["age"] = text;
            await this.sendText("Кем вы работаете?")
        } else if (this.count === 2) {
            this.user["occupation"] = text;
            await this.sendText("У Вас есть хобби?")
        } else if (this.count === 3) {
            this.user["hobby"] = text;
            await this.sendText("Что Вам НЕ нравиться в людях?")
        } else if (this.count === 4) {
            this.user["annoys"] = text;
            await this.sendText("Цели знакомства?")
        } else if (this.count === 5) {
            this.user["goals"] = text;
            const myMessage = await this.sendText("ChatGPT занимается генерацией Вашего профиля...")
            const prompt = this.loadPrompt("profile")
            const info = userInfoToString(this.user)
            const answer = await chatGpt.sendQuestion(prompt, info)
            await bot.editText(myMessage, answer)
        }
    }

    async opener(msg) {
        this.mode = "opener"
        const text = this.loadMessage("opener")
        await this.sendImage("opener");
        await this.sendText(text);

        this.user = {}
        this.count = 0
        await this.sendText("Имя девушки?")
    }


    async openerDialog(msg) {
        const text = msg.text;
        this.count++
        if (this.count === 1) {
            this.user["name"] = text;
            await this.sendText("Сколько ей лет?")
        } else if (this.count === 2) {
            this.user["age"] = text;
            await this.sendText("Оцените ее внешность: 1-10 баллов")
        } else if (this.count === 3) {
            this.user["handsome"] = text;
            await this.sendText("Кем она работает?")
        } else if (this.count === 4) {
            this.user["occupation"] = text;
            await this.sendText("Цель знакомства?")
        } else if (this.count === 5) {
            this.user["goals"] = text;
            const myMessage = await this.sendText("ChatGPT занимается генерацией опенера...")
            const prompt = this.loadPrompt("opener")
            const info = userInfoToString(this.user)
            const answer = await chatGpt.sendQuestion(prompt, info)
            await bot.editText(myMessage, answer)
        }
    }


    async hello(msg) {
        if (this.mode === "gpt")
            await this.gptDialog(msg)
        else if (this.mode === "date")
            await this.dateDialog(msg)
        else if (this.mode === "message")
            await this.messageDialog(msg)
        else if (this.mode === "profile")
            await this.profileDialog(msg)
        else if (this.mode === "opener")
            await this.openerDialog(msg)
        else {
            const text = msg.text;
            await this.sendText('<b>"Привет!"</b>')
            await this.sendText('<i>"Как дела?"</i>')
            await this.sendText(`Вы писали ${text}`)

            await this.sendImage("avatar_main")
            await this.sendTextButtons("Какая у Вас тема в Телеграмм?", {
                "theme_light": "Светлая тема",
                "theme_dark": "Темная тема"
            })
        }
    }

    async helloButtons(callBackQuery) {
        const query = callBackQuery.data;
        if (query === "theme_light")
            await this.sendText("У Вас светлая тема")
        else if (query === "theme_dark")
            await this.sendText("У Вас темная тема")
    }
}

const chatGpt = new ChatGptService("GPT_TOKEN")
const bot = new MyTelegramBot("TELEGRAM_TOKEN");
bot.onCommand(/\/start/, bot.start)
bot.onCommand(/\/html/, bot.html)
bot.onCommand(/\/gpt/, bot.gpt)
bot.onCommand(/\/date/, bot.date)
bot.onCommand(/\/message/, bot.message)
bot.onCommand(/\/profile/, bot.profile)
bot.onCommand(/\/opener/, bot.opener)
bot.onTextMessage(bot.hello)
bot.onButtonCallback(/^date_.*/, bot.dateButtons)
bot.onButtonCallback(/^message_.*/, bot.messageButtons)
bot.onButtonCallback(/^.*/, bot.helloButtons)
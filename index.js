const { Client, Intents } = require("discord.js");
const fs = require('fs');
const brain = require("brain.js")
const crypto = require("decode-encode-binary")
require('dotenv').config()

const botToken = process.env.BOT_TOKEN
const channelID = process.env.CHANNEL_ID
const fileName = "myjsonfile.json"
var redeTreinada;
const prefix = "!";
const setOptions = "--options"
const limitOption = "--limit"
var isTraining = false;

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });
client.login(botToken);


client.once('ready', async () =>
{
	console.log('Ready!');
});


client.on("messageCreate", function (message)
{
	if (message.author.bot) return;
	if (!message.content.startsWith(prefix)) return;
	if (message.content.startsWith(prefix))
	{
		if (message.content.split(" ").length == 1)
		{
			return;
		}
		if (!BrainJs.isTraining())
		{
			var messageToTrainBrainJs = message.content.split(" ").slice(1, message.content.split(" ").length).join(" ");
			var channelIdToSearch = message.channelId;
			BrainJs.trainML(messageToTrainBrainJs, channelIdToSearch)
		}
		else
		{
			message.reply("Please await. I'm still training!")
		}
	}
});


class BrainJs
{

	static isTraining()
	{
		return isTraining
	}

	static setIsTraining()
	{
		isTraining = true;
	}

	static setIsNotTraining()
	{
		isTraining = false;
	}

	static GetBrainJsConfig()
	{
		let learningRate = { learningRate: 0.01 }
		let hiddenLayers = {hiddenLayers:[20,20]}
		return { ...learningRate,...hiddenLayers}
	}

	static async trainML(messageToSearch, channelIdToSearch)
	{
		this.setIsTraining();

		var dados = []

		var channelIdChoosed = channelIdToSearch ?? channelID
		dados = await Mensagem.GetAllMessagesOfAChannelAsync(client.channels.cache.get(channelIdChoosed))

		function runML()
		{
			net.train(dados, { log: true })
			redeTreinada = net.toFunction();
		}

		const net = new brain.NeuralNetwork(this.GetBrainJsConfig())
		const mensagemEncoded = Mensagem.EncodeStringToAscii(messageToSearch)

		runML()

		var resultado = redeTreinada(mensagemEncoded)
		var resultadoAjustado = Mensagem.SortResult(resultado);
		Mensagem.SendResultMessage(resultadoAjustado,channelIdChoosed);

		this.setIsNotTraining();
	}
}

class Usuario
{
	static async GetUser(msg)
	{

		function TratarUsuarioNome(valor)
		{
			function RemoveSpecialCharacters(valor)
			{
				return valor.replace(/[^\w\s]/gi, '')
			}

			valor = RemoveSpecialCharacters(valor);
			valor = valor.toLowerCase();
			return valor
		}

		var usuario = await client.users.fetch(msg.toJSON().authorId.toString());
		return usuario.username
	}

	static EncodeStringToAscii(valor)
	{
		var numero = valor.split('').map(letra => letra.charCodeAt(0)).toString()
		return numero;
	}

	static DecodeAsciiToString(asciiNumber)
	{
		var decodedText = asciiNumber.split(",").map(item =>
		{
			return String.fromCharCode(parseInt(item))
		})
		return decodedText
	}
}

class Mensagem
{
	static SendResultMessage(resultado, channelId)
	{
		client.channels.fetch(channelId).then(channel =>
		{
			var objeto = resultado.shift()
			channel.send(`O usuário mais provavel de ter enviado essa mensagem é ${ objeto.user } com ${ objeto.probabilidade }`);
		});
	}
	static SortResult(objetoResultado)
	{
		var resultadoAjustado = Object.entries(objetoResultado).map(i => { return { user: i[0], probabilidade: parseInt(i[1] * 100) } });
		function compareProbabilidade(a, b)
		{
			if (a.probabilidade === b.probabilidade)
				return 0;

			return a.probabilidade > b.probabilidade ? -1 : 1;
		}
		resultadoAjustado = resultadoAjustado.sort(compareProbabilidade)
		resultadoAjustado = resultadoAjustado.map(item => { return { user: item.user, probabilidade: `${ item.probabilidade }%` } })
		return resultadoAjustado
	}

	static EncodeStringToAscii(valor)
	{
		var valorSplited = valor.split('')
		if(valorSplited.length > 50)
		{
			valorSplited = valorSplited.slice(0,50)
		}
		return valorSplited.map(letter => letter.charCodeAt(0) / 256);
	}

	static GetMsgContent(msg)
	{
		var valor = msg.toJSON().content
		valor = this.EncodeStringToAscii(valor)
		return valor
	}

	static async GetAllMessagesOfAChannelAsync(channel, limit = 100)
	{
		const sum_messages = [];
		let last_id;

		while (true)
		{
			const options = { limit: 100 };
			if (last_id)
			{
				options.before = last_id;
			}

			const messages = await channel.messages.fetch(options);
			sum_messages.push(...await Geral.organizarArray(messages));
			last_id = messages.last().id;
			if (messages.size != 100 || sum_messages.length >= limit)
			{
				break;
			}
		}
		var AllMessages = await Geral.FillEmptyPlaces(await Promise.all(sum_messages));
		return AllMessages;
	}
}

class Geral
{

	static RegerarMensagens(array)
	{
		var novoArray = []
		array.forEach(mensagem =>
		{
			try
			{
				novoArray.push(mensagem.split(' ').reverse().join(' '));
			}
			catch
			{

			}
		})
		array.push(...novoArray)
	}
	static async ReadJson()
	{
		let rawdata = fs.readFileSync(fileName);
		var parsed = await JSON.parse(rawdata)
		return parsed;
	}

	static async SaveToJson(array)
	{
		var json = JSON.stringify(array)
		fs.writeFile(fileName, json, 'utf8', (error) =>
		{
			console.log(error)
		});
	}
	static organizarArray(mensagens)
	{

		return new Promise((resolve, reject) =>
		{
			var mensagensFormatada = mensagens.filter(msg => !msg.toJSON().content.startsWith("!train")).map(async msg =>
			{
				var usuario = await Usuario.GetUser(msg);
				var mensagem = Mensagem.GetMsgContent(msg);
				return {
					input: mensagem,
					output: { [`${ usuario }`]: 1 }
				}
			})
			resolve(mensagensFormatada)
		})
	}

	// esse método serve para um problema que o brainjs apresenta.
	// quando se é treinado com um texto hipergigantesco o resultado será NaN
	static FillEmptyPlaces(array)
	{
		return new Promise((resolve, reject) =>
		{
			var biggestLengthArray = array.map(a => a.input.length)
				.indexOf(Math.max(...array.map(a => a.input.length)));

			var newArray = []

			array.forEach((item, index) =>
			{
				if (index != biggestLengthArray)
				{
					if (item.input.length < array[biggestLengthArray].input.length)
					{
						while (item.input.length < array[biggestLengthArray].input.length)
						{
							item.input.push(0);
						}
					}
				}
				newArray.push(...[item])
			})

			array = [...newArray];
			resolve(array = [...newArray])
		})
	}
}


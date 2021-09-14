const { Client, Intents } = require("discord.js");
const fs = require('fs');
const brain = require("brain.js")
const crypto = require("decode-encode-binary")
require('dotenv').config()

const botToken = process.env.BOT_TOKEN
const channelID = process.env.CHANNEL_ID
const fileName = "myjsonfile.json"
var redeTreinada;

const client = new Client({ intents: [Intents.FLAGS.GUILDS] });
client.login(botToken);


client.once('ready', async () =>
{
	console.log('Ready!');
	var allMessages = await Mensagem.GetAllMessagesOfAChannelAsync(client.channels.cache.get(channelID))
	BrainJs.trainML(allMessages)
});



class BrainJs
{

	static GetBrainJsConfig()
	{
		let layers = { hiddenLayers: [20] }
		let learningRate = { learningRate: 0.01 }
		let decayRate = { decayRate: 0.999 }
		return { ...layers, ...learningRate, ...decayRate }
	}

	static trainML(dados)
	{

		function runML()
		{
			net.train(dados, { log: false })
			redeTreinada = net.toFunction();
		}

		const net = new brain.NeuralNetwork(this.GetBrainJsConfig())
		const mensagem = "teste"
		const mensagemEncoded = crypto.encode(mensagem)
		runML()
		var resultado = redeTreinada(mensagemEncoded)
		console.log(resultado)

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
	static EncodeStringToAscii(valor)
	{
		return valor.charCodeAt(0);
	}

	static GetMsgContent(msg, encode = true)
	{
		var valor = msg.toJSON().content
		if (encode)
		{
			try
			{
				valor = crypto.encode(valor)
			}
			catch
			{
			}
		}
		return valor
	}

	static async GetAllMessagesOfAChannelAsync(channel, limit = 500)
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

			if (messages.size != 100 || sum_messages >= limit)
			{
				break;
			}
		}
		return await Promise.all(sum_messages);
	}
}

class Geral
{
    static RegerarMensagens(array)
	{
		var novoArray = []
		array.forEach(mensagem=>{
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
			var mensagensFormatada = mensagens.map(async msg =>
			{
				var usuario = await Usuario.GetUser(msg);
				return {
					input: Mensagem.GetMsgContent(msg),
					output: { [`${ usuario }`]: 1 }
				}
			})
			resolve(mensagensFormatada)
		})
	}
}


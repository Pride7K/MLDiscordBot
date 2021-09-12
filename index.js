const { Client, Intents } = require("discord.js");
var fs = require('fs');
require('dotenv').config()

const botToken = process.env.BOT_TOKEN
const channelID = process.env.CHANNEL_ID
const fileName = "myjsonfile.json"


const client = new Client({ intents: [Intents.FLAGS.GUILDS] });
client.login(botToken);


client.once('ready', async () =>
{
	console.log('Ready!');
	var allMessages = await GetAllMessagesAsync(client.channels.cache.get(channelID))
	SaveToJson(JSON.stringify(allMessages))
	console.log(await ReadJson())
});

async function ReadJson()
{
	let rawdata = fs.readFileSync(fileName);
	var parsed = await JSON.parse(rawdata)
	return parsed;
}

async function SaveToJson(json)
{
	fs.writeFile(fileName, json, 'utf8', (error) =>
	{
		console.log(error)
	});
}


async function GetAllMessagesAsync(channel, limit = 500)
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
		sum_messages.push(...await resolveArray(messages));
		last_id = messages.last().id;

		if (messages.size != 100 || sum_messages >= limit)
		{
			break;
		}
	}
	return await Promise.all(sum_messages);
}


function EncodeStringToAscii(valor)
{
	return valor.charCodeAt(0) / 256;
}



function resolveArray(mensagens)
{

	async function GetUser(msg)
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
		return TratarUsuarioNome(usuario.username)
	}

	function GetMsgContent(msg)
	{
		var valor = msg.toJSON().content
		valor = EncodeStringToAscii(valor)
		return valor
	}

	return new Promise((resolve, reject) =>
	{
		var mensagensFormatada = mensagens.map(async msg =>
		{
			return {
				input: GetMsgContent(msg),
				output: await GetUser(msg)
			}
		})
		resolve(mensagensFormatada)
	})
}


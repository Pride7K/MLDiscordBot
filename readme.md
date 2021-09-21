
# 🤖 MLDiscordBot

*Ainda em desenvolvimento*

Projeto utilizando Machine Learning com um bot rodando no discord para treina-lo.

## 💡 Ideia

Utilizar o bot do discord para pegar uma mensagem que servirá para buscar um resultado de quem enviaria uma mensagem parecida.

__Principais Bibliotecas Utilizadas__:

* [Brain.js](https://github.com/BrainJS/brain.js) para machine Learning

* [Discord.js](https://discord.com/developers/docs) para o discord bot

Para isso basta enviar '!train' e em seguida a mensagem. Segue o exemplo abaixo.

![IMG](https://github.com/Pride7K/imagens/blob/master/Screenshot_9.png?raw=true)


Após enviado o comando com a mensagem, será feito várias consultas utilizando a biblioteca do discord até que se chegue no limite estipulado, 100 mensagens.

Em seguida as mensagens serão organizadas para que sejam aceitas pelo brain.js e então comparada com a mensagem enviada.



## 🎓 Autor

- [@Pride7K](https://github.com/Pride7K)


## ⚙️ Como intalar

Primeiro de tudo você deve criar o seu bot no portal do discord e integrar com o seu servidor.

Feito isso, siga os seguintes passos:

Clone o projeto

```bash
  git clone https://github.com/Pride7K/MLDiscordBot.git
```

Vá até o diretório do projeto

```bash
  cd MLDiscordBot 
```

Criei um arquivo na raiz do projeto com o nome: **.env**

No arquivo .env crie a seguinte chave: **BOT_TOKEN** e insira o token fornecido no portal do discord.

Você também pode fornecer um canal default para o bot com a chave CHANNEL_ID, mas não é necessário.


Instale as dependências

```bash
  npm install
```

Iniciar o bot

```bash
  nodemon index.js
```

  
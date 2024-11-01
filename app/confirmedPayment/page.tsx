// Configurar webhook para receber a confirmação de pagamento. quando inicio o pagamento incluo o id do site no checkoutSession para identificar o id exclusivo (unico) que 
// se refere a um site que fez o cadastro na plataforma. 




// O webhook sera ativado evniando o payment id, com ele consigo obter o checkout session com o metadata constando o site id
// no event de pagamento obtenho o metadata com o id do pagamento que foi pago (paid), com o id do pagamento consigo obter o checkout by payment id, onde consigo obter o id do site
// que é  chave primaria do banco, ai busco no banco as ifnormações daquele id, se estiver com status paid, altero os dados no banco para que o site seja listado no dashboard.




// quando um usuário clica no link listado é verificado se já foi clicado antes mediante consulta no banco, se é o primeiro a clicar o usario é redirecionado para sacar
// uma parcela do valor depositado pelo que fez o cadastro (pagou) - o usuario entao é normalmente direcionado ao site em questao. O processo termina e o site continua sendo listado normalmente.

// pages/blank.js

const BlankPage = () => {
  return (
    <div></div> // This will render an empty page.
  );
};

export default BlankPage;
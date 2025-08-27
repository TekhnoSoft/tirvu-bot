import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Logo from '../../components/Logo';
import Button from '../../components/Button';
import './style.css';

const Terms = () => {

    const navigate = useNavigate();

    const goBack = () => {
        navigate(-1);
    };

    return (
        <div className="policy-container">
            <div className="policy-header">
                <Link to="/" className="policy-logo-link">
                    <Logo size="medium" />
                </Link>
                <Button
                    variant="secondary"
                    size="small"
                    onClick={goBack}
                    className="policy-back-button"
                >
                    <i className="fas fa-arrow-left"></i> Voltar
                </Button>
            </div>

            <div className="policy-content">
                <h1>Termos de Uso</h1>
                <p className="policy-updated">Última atualização: 23 de Maio de 2023</p>

                <div className="policy-section">
                    <h2>1. Aceitação dos Termos</h2>
                    <p>
                        Bem-vindo à plataforma VBOT de campanhas inteligentes com IA. Estes Termos de Uso
                        ("Termos") constituem um acordo legal entre você ("Usuário", "você" ou "seu") e
                        VBOT Tecnologia Ltda. ("VBOT", "nós", "nosso" ou "empresa"), regulando o acesso
                        e uso da plataforma VBOT, incluindo todos os serviços, funcionalidades, aplicativos
                        e ferramentas relacionados (coletivamente, a "Plataforma").
                    </p>
                    <p>
                        Ao acessar ou utilizar nossa Plataforma, você concorda em cumprir e estar vinculado
                        a estes Termos. Se você não concordar com qualquer parte destes Termos, não poderá
                        acessar ou utilizar nossa Plataforma.
                    </p>
                </div>

                <div className="policy-section">
                    <h2>2. Descrição do Serviço</h2>
                    <p>
                        A VBOT oferece uma plataforma de criação e gestão de campanhas de marketing com
                        tecnologia de inteligência artificial, permitindo a segmentação de leads, automação
                        de disparos e análise de resultados.
                    </p>
                    <p>
                        Nossos serviços incluem, mas não se limitam a:
                    </p>
                    <ul>
                        <li>Criação e gestão de campanhas de marketing</li>
                        <li>Segmentação de público-alvo</li>
                        <li>Automação de disparos de mensagens</li>
                        <li>Análise de desempenho e resultados</li>
                        <li>Otimização de campanhas com inteligência artificial</li>
                        <li>Integração com outras plataformas e sistemas</li>
                    </ul>
                    <p>
                        Reservamo-nos o direito de modificar, suspender ou descontinuar qualquer aspecto
                        da Plataforma a qualquer momento, incluindo a disponibilidade de qualquer recurso,
                        banco de dados ou conteúdo.
                    </p>
                </div>

                <div className="policy-section">
                    <h2>3. Cadastro e Conta</h2>
                    <h3>3.1 Requisitos para Cadastro</h3>
                    <p>
                        Para utilizar nossa Plataforma, você deve:
                    </p>
                    <ul>
                        <li>Ter pelo menos 18 anos de idade</li>
                        <li>Fornecer informações precisas, atuais e completas durante o processo de registro</li>
                        <li>Manter suas informações de conta atualizadas</li>
                        <li>Ser responsável pela confidencialidade de suas credenciais de acesso</li>
                    </ul>

                    <h3>3.2 Responsabilidade pela Conta</h3>
                    <p>
                        Você é inteiramente responsável por todas as atividades realizadas em sua conta.
                        Você concorda em notificar-nos imediatamente sobre qualquer uso não autorizado
                        de sua conta ou qualquer outra violação de segurança.
                    </p>
                    <p>
                        Não somos responsáveis por quaisquer perdas ou danos resultantes do seu não
                        cumprimento desta obrigação de segurança.
                    </p>
                </div>

                <div className="policy-section">
                    <h2>4. Uso da Plataforma</h2>
                    <h3>4.1 Uso Permitido</h3>
                    <p>
                        Você concorda em usar a Plataforma apenas para fins legítimos e de acordo com
                        estes Termos. Você pode:
                    </p>
                    <ul>
                        <li>Criar e gerenciar campanhas de marketing</li>
                        <li>Carregar e gerenciar listas de contatos em conformidade com a legislação aplicável</li>
                        <li>Utilizar as ferramentas de análise e otimização disponíveis</li>
                        <li>Integrar a Plataforma com outros serviços autorizados</li>
                    </ul>

                    <h3>4.2 Restrições de Uso</h3>
                    <p>
                        Você concorda em não:
                    </p>
                    <ul>
                        <li>Utilizar a Plataforma para enviar spam, mensagens não solicitadas ou conteúdo ilegal</li>
                        <li>Violar direitos de propriedade intelectual ou outros direitos de terceiros</li>
                        <li>Tentar acessar, modificar ou interferir em áreas restritas da Plataforma</li>
                        <li>Realizar engenharia reversa, descompilar ou desmontar qualquer parte da Plataforma</li>
                        <li>Utilizar a Plataforma para distribuir malware ou realizar ataques cibernéticos</li>
                        <li>Utilizar a Plataforma para coletar dados de forma não autorizada</li>
                        <li>Revender, sublicenciar ou transferir seu acesso à Plataforma</li>
                    </ul>
                </div>

                <div className="policy-section">
                    <h2>5. Conteúdo e Propriedade Intelectual</h2>
                    <h3>5.1 Seu Conteúdo</h3>
                    <p>
                        Você mantém todos os direitos sobre o conteúdo que você cria, carrega ou
                        compartilha na Plataforma ("Seu Conteúdo"). Ao utilizar nossa Plataforma,
                        você nos concede uma licença mundial, não exclusiva, isenta de royalties,
                        sublicenciável e transferível para usar, reproduzir, modificar, adaptar,
                        publicar, traduzir e distribuir Seu Conteúdo em conexão com a operação e
                        fornecimento da Plataforma.
                    </p>
                    <p>
                        Você declara e garante que:
                    </p>
                    <ul>
                        <li>Possui todos os direitos necessários sobre Seu Conteúdo</li>
                        <li>Seu Conteúdo não viola direitos de terceiros</li>
                        <li>Seu Conteúdo está em conformidade com todas as leis e regulamentos aplicáveis</li>
                    </ul>

                    <h3>5.2 Nossa Propriedade Intelectual</h3>
                    <p>
                        A Plataforma, incluindo seu código-fonte, recursos, funcionalidades, design,
                        textos, gráficos, logotipos, ícones e imagens, é de propriedade exclusiva da
                        VBOT ou de seus licenciadores e é protegida por leis de direitos autorais,
                        marcas registradas e outras leis de propriedade intelectual.
                    </p>
                    <p>
                        Estes Termos não concedem a você qualquer direito, título ou interesse em
                        nossa Plataforma, nossa marca ou nossa propriedade intelectual.
                    </p>
                </div>

                <div className="policy-section">
                    <h2>6. Inteligência Artificial e Conteúdo Gerado</h2>
                    <p>
                        Nossa Plataforma utiliza tecnologias de inteligência artificial (IA) para
                        otimizar campanhas e gerar conteúdo. Em relação a estas funcionalidades:
                    </p>
                    <ul>
                        <li>
                            O conteúdo gerado por IA em nossa Plataforma é fornecido "no estado em que se
                            encontra" e deve ser revisado por você antes do uso
                        </li>
                        <li>
                            Não garantimos que o conteúdo gerado por IA seja preciso, completo, adequado
                            para qualquer finalidade específica ou livre de preconceitos
                        </li>
                        <li>
                            Você é responsável por revisar, editar e aprovar qualquer conteúdo gerado
                            por IA antes de usá-lo em suas campanhas
                        </li>
                        <li>
                            Você mantém a propriedade do conteúdo final que criar usando nossas ferramentas
                            de IA, sujeito à licença concedida na seção 5.1
                        </li>
                    </ul>
                </div>

                <div className="policy-section">
                    <h2>7. Pagamentos e Assinaturas</h2>
                    <h3>7.1 Planos e Preços</h3>
                    <p>
                        A VBOT oferece diferentes planos de assinatura com recursos e limitações
                        variados. Os preços e detalhes de cada plano estão disponíveis em nossa
                        Plataforma e podem ser alterados mediante aviso prévio.
                    </p>
                    <p>
                        Ao assinar um plano pago, você concorda em pagar todas as taxas aplicáveis
                        conforme descrito no momento da compra. Todos os pagamentos são não reembolsáveis,
                        exceto quando exigido por lei ou conforme expressamente estabelecido nestes Termos.
                    </p>

                    <h3>7.2 Renovação Automática</h3>
                    <p>
                        As assinaturas são renovadas automaticamente ao final de cada período de
                        assinatura, a menos que você cancele antes da data de renovação. Você pode
                        cancelar sua assinatura a qualquer momento através das configurações da sua conta.
                    </p>

                    <h3>7.3 Alterações de Preço</h3>
                    <p>
                        Podemos alterar os preços de nossos serviços a qualquer momento. Qualquer
                        alteração de preço será comunicada com pelo menos 30 dias de antecedência
                        e será aplicada apenas no próximo período de faturamento.
                    </p>
                </div>

                <div className="policy-section">
                    <h2>8. Limitação de Responsabilidade</h2>
                    <p>
                        Na extensão máxima permitida pela lei aplicável, a VBOT e seus diretores,
                        funcionários, agentes, afiliados e parceiros não serão responsáveis por
                        quaisquer danos indiretos, incidentais, especiais, consequenciais ou punitivos,
                        incluindo, mas não se limitando a, perda de lucros, dados, uso, reputação ou
                        outras perdas intangíveis, resultantes de:
                    </p>
                    <ul>
                        <li>Seu acesso ou uso ou incapacidade de acessar ou usar a Plataforma</li>
                        <li>Qualquer conduta ou conteúdo de terceiros na Plataforma</li>
                        <li>Conteúdo obtido através da Plataforma</li>
                        <li>Acesso não autorizado, uso ou alteração de suas transmissões ou conteúdo</li>
                    </ul>
                    <p>
                        Em nenhum caso nossa responsabilidade total para com você por todos os danos
                        excederá o valor pago por você à VBOT nos últimos 12 meses ou R$ 1.000,00,
                        o que for maior.
                    </p>
                </div>

                <div className="policy-section">
                    <h2>9. Indenização</h2>
                    <p>
                        Você concorda em defender, indenizar e isentar a VBOT e seus diretores,
                        funcionários, agentes, afiliados e parceiros de e contra quaisquer reclamações,
                        responsabilidades, danos, perdas e despesas, incluindo, sem limitação, custos
                        legais e contábeis razoáveis, decorrentes de ou de alguma forma relacionados com:
                    </p>
                    <ul>
                        <li>Seu acesso ou uso da Plataforma</li>
                        <li>Sua violação destes Termos</li>
                        <li>Seu Conteúdo</li>
                        <li>Sua violação de qualquer lei ou direitos de terceiros</li>
                    </ul>
                </div>

                <div className="policy-section">
                    <h2>10. Rescisão</h2>
                    <p>
                        Podemos encerrar ou suspender seu acesso à Plataforma imediatamente, sem aviso
                        prévio ou responsabilidade, por qualquer motivo, incluindo, sem limitação, se
                        você violar estes Termos.
                    </p>
                    <p>
                        Após a rescisão, seu direito de usar a Plataforma cessará imediatamente. Se
                        você deseja encerrar sua conta, pode simplesmente descontinuar o uso da Plataforma
                        ou solicitar o cancelamento através das configurações da sua conta.
                    </p>
                    <p>
                        Todas as disposições dos Termos que, por sua natureza, devem sobreviver à
                        rescisão, sobreviverão à rescisão, incluindo, sem limitação, disposições de
                        propriedade, isenções de garantia, indenização e limitações de responsabilidade.
                    </p>
                </div>

                <div className="policy-section">
                    <h2>11. Alterações nos Termos</h2>
                    <p>
                        Reservamo-nos o direito, a nosso critério exclusivo, de modificar ou substituir
                        estes Termos a qualquer momento. Se uma revisão for material, forneceremos pelo
                        menos 30 dias de aviso antes que quaisquer novos termos entrem em vigor. O que
                        constitui uma alteração material será determinado a nosso critério exclusivo.
                    </p>
                    <p>
                        Ao continuar a acessar ou usar nossa Plataforma após essas revisões se tornarem
                        efetivas, você concorda em estar vinculado aos termos revisados. Se você não
                        concordar com os novos termos, deixe de usar a Plataforma.
                    </p>
                </div>

                <div className="policy-section">
                    <h2>12. Disposições Gerais</h2>
                    <h3>12.1 Lei Aplicável</h3>
                    <p>
                        Estes Termos serão regidos e interpretados de acordo com as leis do Brasil,
                        independentemente de seus princípios de conflito de leis.
                    </p>

                    <h3>12.2 Resolução de Disputas</h3>
                    <p>
                        Qualquer disputa decorrente ou relacionada a estes Termos será submetida à
                        jurisdição exclusiva dos tribunais da cidade de São Paulo, Brasil.
                    </p>

                    <h3>12.3 Independência das Cláusulas</h3>
                    <p>
                        Se qualquer disposição destes Termos for considerada inválida ou inexequível,
                        tal disposição será eliminada ou limitada ao mínimo necessário para que os
                        Termos restantes permaneçam em pleno vigor e efeito.
                    </p>

                    <h3>12.4 Acordo Integral</h3>
                    <p>
                        Estes Termos constituem o acordo integral entre você e a VBOT em relação ao
                        assunto aqui tratado e substituem todos os acordos, entendimentos, representações
                        e propostas anteriores, sejam escritos ou orais.
                    </p>

                    <h3>12.5 Renúncia</h3>
                    <p>
                        A falha da VBOT em exercer ou fazer cumprir qualquer direito ou disposição
                        destes Termos não constituirá uma renúncia a tal direito ou disposição.
                    </p>

                    <h3>12.6 Cessão</h3>
                    <p>
                        Você não pode ceder ou transferir estes Termos, por força de lei ou de outra
                        forma, sem nosso consentimento prévio por escrito. Qualquer tentativa de cessão
                        ou transferência que viole esta seção será nula. A VBOT pode ceder ou transferir
                        estes Termos, a seu critério, sem restrição.
                    </p>
                </div>

                <div className="policy-section">
                    <h2>13. Contato</h2>
                    <p>
                        Se você tiver dúvidas sobre estes Termos, entre em contato conosco:
                    </p>
                    <div className="policy-contact-info">
                        <p><strong>E-mail:</strong> vcarclube@gmail.com</p>
                    </div>
                </div>
            </div>

            <div className="policy-footer">
                <p>© 2023 VBOT. Todos os direitos reservados.</p>
                <div className="policy-footer-links">
                    <Link to="/terms" className="active">Termos de Uso</Link>
                    <Link to="/privacy">Política de Privacidade</Link>
                </div>
            </div>
        </div>
    );
};

export default Terms;
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Logo from '../../components/Logo';
import Button from '../../components/Button';
import './style.css';

const Privacy = () => {

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
                <h1>Política de Privacidade</h1>
                <p className="policy-updated">Última atualização: 23 de Maio de 2023</p>

                <div className="policy-section">
                    <h2>1. Introdução</h2>
                    <p>
                        A VBOT ("nós", "nosso" ou "empresa") está comprometida em proteger sua privacidade.
                        Esta Política de Privacidade explica como coletamos, usamos, divulgamos e protegemos
                        suas informações quando você utiliza nossa plataforma de campanhas inteligentes
                        ("Plataforma").
                    </p>
                    <p>
                        Ao utilizar nossa Plataforma, você concorda com a coleta e uso de informações de
                        acordo com esta política. Recomendamos que você leia este documento na íntegra para
                        entender nossas práticas em relação aos seus dados.
                    </p>
                </div>

                <div className="policy-section">
                    <h2>2. Informações que Coletamos</h2>

                    <h3>2.1 Informações Fornecidas por Você</h3>
                    <p>Podemos coletar os seguintes tipos de informações que você nos fornece diretamente:</p>
                    <ul>
                        <li>Informações de cadastro (nome, e-mail, telefone, cargo, empresa)</li>
                        <li>Informações de faturamento e pagamento</li>
                        <li>Conteúdo que você cria, carrega ou recebe de outros ao usar nossos serviços</li>
                        <li>Comunicações com nossa equipe de suporte</li>
                    </ul>

                    <h3>2.2 Informações Coletadas Automaticamente</h3>
                    <p>Quando você utiliza nossa Plataforma, podemos coletar automaticamente:</p>
                    <ul>
                        <li>Dados de uso e interação com a Plataforma</li>
                        <li>Informações do dispositivo (tipo, sistema operacional, navegador)</li>
                        <li>Endereço IP e dados de localização aproximada</li>
                        <li>Cookies e tecnologias similares</li>
                        <li>Registros de acesso e atividades</li>
                    </ul>

                    <h3>2.3 Informações de Terceiros</h3>
                    <p>
                        Podemos receber informações sobre você de terceiros, incluindo parceiros de negócios,
                        provedores de análise e serviços de verificação de identidade.
                    </p>
                </div>

                <div className="policy-section">
                    <h2>3. Como Utilizamos Suas Informações</h2>
                    <p>Utilizamos as informações coletadas para:</p>
                    <ul>
                        <li>Fornecer, manter e melhorar nossa Plataforma</li>
                        <li>Processar transações e gerenciar sua conta</li>
                        <li>Personalizar sua experiência e oferecer conteúdo relevante</li>
                        <li>Desenvolver novos produtos e recursos</li>
                        <li>Comunicar-nos com você sobre atualizações, ofertas e eventos</li>
                        <li>Proteger a segurança e integridade da Plataforma</li>
                        <li>Cumprir obrigações legais e regulatórias</li>
                        <li>Analisar tendências e comportamentos dos usuários</li>
                    </ul>
                </div>

                <div className="policy-section">
                    <h2>4. Inteligência Artificial e Processamento de Dados</h2>
                    <p>
                        Nossa Plataforma utiliza tecnologias de inteligência artificial (IA) para otimizar
                        campanhas e melhorar a experiência do usuário. Ao utilizar nossos serviços:
                    </p>
                    <ul>
                        <li>
                            Seus dados podem ser processados por algoritmos de IA para gerar insights,
                            recomendações e conteúdo personalizado
                        </li>
                        <li>
                            Podemos utilizar dados agregados e anonimizados para treinar e melhorar
                            nossos modelos de IA
                        </li>
                        <li>
                            Você mantém a propriedade do conteúdo que cria, mesmo quando processado
                            por nossa tecnologia de IA
                        </li>
                    </ul>
                    <p>
                        Implementamos medidas técnicas e organizacionais para garantir que o processamento
                        de IA seja transparente, justo e seguro.
                    </p>
                </div>

                <div className="policy-section">
                    <h2>5. Compartilhamento de Informações</h2>
                    <p>Podemos compartilhar suas informações com:</p>
                    <ul>
                        <li>
                            <strong>Prestadores de serviços:</strong> empresas que nos auxiliam na
                            operação da Plataforma (processamento de pagamentos, hospedagem, análise de dados)
                        </li>
                        <li>
                            <strong>Parceiros de negócios:</strong> quando oferecemos serviços em conjunto
                            com outras empresas
                        </li>
                        <li>
                            <strong>Cumprimento legal:</strong> quando exigido por lei, processo judicial
                            ou solicitação governamental
                        </li>
                        <li>
                            <strong>Proteção de direitos:</strong> para proteger nossos direitos, propriedade
                            ou segurança, bem como de nossos usuários
                        </li>
                        <li>
                            <strong>Transações corporativas:</strong> em conexão com uma fusão, aquisição
                            ou venda de ativos
                        </li>
                    </ul>
                    <p>
                        Não vendemos suas informações pessoais a terceiros para fins de marketing.
                    </p>
                </div>

                <div className="policy-section">
                    <h2>6. Segurança de Dados</h2>
                    <p>
                        Implementamos medidas técnicas e organizacionais apropriadas para proteger suas
                        informações contra acesso não autorizado, alteração, divulgação ou destruição.
                        Estas medidas incluem:
                    </p>
                    <ul>
                        <li>Criptografia de dados em trânsito e em repouso</li>
                        <li>Controles de acesso rigorosos</li>
                        <li>Monitoramento contínuo de segurança</li>
                        <li>Avaliações regulares de vulnerabilidades</li>
                        <li>Treinamento de segurança para nossa equipe</li>
                    </ul>
                    <p>
                        Embora nos esforcemos para proteger suas informações, nenhum método de transmissão
                        pela internet ou armazenamento eletrônico é 100% seguro. Portanto, não podemos
                        garantir segurança absoluta.
                    </p>
                </div>

                <div className="policy-section">
                    <h2>7. Seus Direitos e Escolhas</h2>
                    <p>Dependendo da sua localização, você pode ter os seguintes direitos:</p>
                    <ul>
                        <li>Acessar e receber uma cópia das suas informações pessoais</li>
                        <li>Retificar informações imprecisas</li>
                        <li>Solicitar a exclusão de suas informações (sujeito a exceções legais)</li>
                        <li>Restringir ou opor-se ao processamento de seus dados</li>
                        <li>Solicitar a portabilidade de seus dados</li>
                        <li>Retirar o consentimento a qualquer momento</li>
                        <li>Apresentar uma reclamação a uma autoridade de proteção de dados</li>
                    </ul>
                    <p>
                        Para exercer estes direitos, entre em contato conosco através dos canais
                        indicados na seção "Contato" abaixo.
                    </p>
                </div>

                <div className="policy-section">
                    <h2>8. Retenção de Dados</h2>
                    <p>
                        Mantemos suas informações pelo tempo necessário para cumprir as finalidades
                        descritas nesta Política de Privacidade, a menos que um período de retenção
                        mais longo seja exigido ou permitido por lei. Os critérios utilizados para
                        determinar nossos períodos de retenção incluem:
                    </p>
                    <ul>
                        <li>O período em que você mantém uma conta ativa em nossa Plataforma</li>
                        <li>Obrigações legais às quais estamos sujeitos</li>
                        <li>Recomendações de autoridades de proteção de dados</li>
                        <li>Prazos de prescrição aplicáveis a possíveis reivindicações legais</li>
                    </ul>
                </div>

                <div className="policy-section">
                    <h2>9. Transferências Internacionais de Dados</h2>
                    <p>
                        Suas informações podem ser transferidas e processadas em países diferentes
                        daquele em que você reside. Estes países podem ter leis de proteção de dados
                        diferentes das leis do seu país.
                    </p>
                    <p>
                        Quando transferimos dados para fora do seu país, implementamos salvaguardas
                        apropriadas para garantir que suas informações permaneçam protegidas de acordo
                        com esta Política de Privacidade e as leis aplicáveis.
                    </p>
                </div>

                <div className="policy-section">
                    <h2>10. Alterações a Esta Política</h2>
                    <p>
                        Podemos atualizar esta Política de Privacidade periodicamente para refletir
                        alterações em nossas práticas ou por outros motivos operacionais, legais ou
                        regulatórios. Notificaremos você sobre quaisquer alterações materiais através
                        de aviso em nossa Plataforma ou por outros meios apropriados.
                    </p>
                    <p>
                        Recomendamos que você revise esta política regularmente para estar informado
                        sobre como protegemos suas informações.
                    </p>
                </div>

                <div className="policy-section">
                    <h2>11. Contato</h2>
                    <p>
                        Se você tiver dúvidas, preocupações ou solicitações relacionadas a esta
                        Política de Privacidade ou ao processamento de suas informações, entre em
                        contato conosco:
                    </p>
                    <div className="policy-contact-info">
                        <p><strong>E-mail:</strong> vcarclube@gmail.com</p>
                    </div>
                    <p>
                        Responderemos à sua solicitação dentro do prazo estabelecido pela legislação aplicável.
                    </p>
                </div>
            </div>

            <div className="policy-footer">
                <p>© 2025 VBOT. Todos os direitos reservados.</p>
                <div className="policy-footer-links">
                    <Link to="/terms">Termos de Uso</Link>
                    <Link to="/privacy" className="active">Política de Privacidade</Link>
                </div>
            </div>
        </div>
    );
};

export default Privacy;
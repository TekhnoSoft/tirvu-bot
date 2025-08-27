import ReactPaginate from 'react-paginate';
import React, { useState, useEffect } from 'react';
import './style.css'; // Certifique-se de criar um arquivo CSS para incluir suas classes
import Utils from '../../Utils';

const LeadsTable = ({filteredLeads, handleEditLead, handleDeleteLead}) => {

    const [pageCount, setPageCount] = useState(0);
    const [currentPage, setCurrentPage] = useState(0);
    const leadsPerPage = 10; // Define quantos leads mostrar por página

    useEffect(() => {
        const pageCount = Math.ceil(filteredLeads.length / leadsPerPage);
        setPageCount(pageCount);
    }, [filteredLeads]);

    const handlePageClick = (data) => {
        setCurrentPage(data.selected);
    };

    // Formatar data para exibição
    const formatDate = (dateString) => {
        if (!dateString) return '-';

        try {
            return new Date(dateString).toLocaleDateString('pt-BR');
        } catch (error) {
            return dateString;
        }
    };

    const displayLeads = filteredLeads.slice(currentPage * leadsPerPage, (currentPage + 1) * leadsPerPage);

    return (
        <div>
            <div className="leads-table-container">
                <table className="leads-table">
                    <thead>
                        <tr>
                            <th>Nome</th>
                            <th>Email</th>
                            <th>Celular</th>
                            <th>Grupo</th>
                            <th>Estado</th>
                            <th>Cidade</th>
                            <th>Etapa&nbsp;do&nbsp;Funil</th>
                            <th>Cadastro</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {displayLeads.map(lead => (
                            <tr key={lead.id}>
                                <td className="lead-name">{lead.Nome || '-'}</td>
                                <td>{lead.Email || '-'}</td>
                                <td>{Utils.formatToCelular(lead.Celular) || '-'}</td>
                                <td>{lead.NomeGrupo ? <span className="lead-group">{lead.NomeGrupo}</span> : '-'}</td>
                                <td>{lead.Estado || '-'}</td>
                                <td>{lead.Cidade || '-'}</td>
                                <td>{lead.EtapaFunil ? <span className="lead-stage">{lead.EtapaFunil}</span> : '-'}</td>
                                <td>{formatDate(lead.DataCadastro)}</td>
                                <td className="lead-actions">
                                    <button className="lead-action-btn edit" onClick={() => handleEditLead(lead)} title="Editar">
                                        <i className="fas fa-edit"></i>
                                    </button>
                                    <button className="lead-action-btn delete" onClick={() => handleDeleteLead(lead.Id)} title="Remover">
                                        <i className="fas fa-trash-alt"></i>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
       
            <ReactPaginate
                previousLabel={Utils.mobileCheck() ? '<' : 'anterior'}
                nextLabel={Utils.mobileCheck() ? '>' : 'próximo'}
                breakLabel={'...'}
                pageCount={pageCount}
                marginPagesDisplayed={2}
                pageRangeDisplayed={Utils.mobileCheck() ? 0: 5}
                onPageChange={handlePageClick}
                containerClassName={'pagination'}
                activeClassName={'active'}
                previousClassName={'page-item'}
                nextClassName={'page-item'}
                pageClassName={'page-item'}
            />
        </div>
    );
};

export default LeadsTable;
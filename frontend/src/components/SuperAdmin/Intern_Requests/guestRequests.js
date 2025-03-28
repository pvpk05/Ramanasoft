import React, { useEffect, useState } from 'react';
import { Table, Container, Form, Button } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { FaCheck, FaTimes } from 'react-icons/fa';
import apiService from '../../../apiService';
const GuestRegistrationRequests = () => {
  const [candidates, setCandidates] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCandidates, setSelectedCandidates] = useState([]);

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    try {
      const response = await apiService.get("/api/guest-requests");
      setCandidates(response.data);
      console.log("Guest Requests :", response.data);
    } catch (error) {
      console.error('Error fetching candidates:', error);
    }
  };

  const handleAccept = async (acceptedCandidates) => {
    try {
      const response = await apiService.post("/api/accept-guests", acceptedCandidates);
      const { accepted, rejected } = response.data;
  
      if (accepted.length > 0 && rejected.length === 0) {
        toast.success("All guests accepted successfully!", {
          autoClose: 5000
        });
      } else if (rejected.length > 0 && accepted.length === 0) {
        toast.error("All guests rejected!", {
          autoClose: 5000
        });
        rejected.forEach(candidate => {
          toast.error(`Candidate ${candidate.fullName} (${candidate.email}) was not accepted because they already exist in the database.`, {
            autoClose: 5000
          });
        });
      } else {
        accepted.forEach(candidate => {
          toast.success(`Candidate ${candidate.fullName} (${candidate.email}) accepted successfully!`, {
            autoClose: 5000
          });
        });
        rejected.forEach(candidate => {
          toast.error(`Candidate ${candidate.fullName} (${candidate.email}) was rejected because they already exist in the database.`, {
            autoClose: 5000
          });
        });
      }
  
      fetchCandidates();
      setSelectedCandidates([]);
    } catch (error) {
      console.error('Error accepting candidate:', error);
      toast.error(`There was an error accepting the registration: ${error.message}`, {
        autoClose: 5000
      });
    }
  };
  
  const handleReject = async (rejectedCandidates) => {
    try {
      await apiService.post("/api/reject-guests", rejectedCandidates)
      .then(response => {
        toast.success("Registration Rejected successfully!", {
          autoClose: 5000
        });
        fetchCandidates();
        setSelectedCandidates([]);
      })
      .catch(error => {
        toast.error(`There was an error rejecting the registration ${error}`, {
          autoClose: 5000
        });
      });
    } catch (error) {
      console.error('Error rejecting candidate:', error);
    }
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleSelectCandidate = (candidate) => {
    setSelectedCandidates(prevSelected => {
      if (prevSelected.includes(candidate)) {
        return prevSelected.filter(cand => cand._id !== candidate._id);
      } else {
        return [...prevSelected, candidate];
      }
    });
  };

  const handleSelectAllCandidates = () => {
    if (selectedCandidates.length === filteredCandidates.length) {
      setSelectedCandidates([]);
    } else {
      setSelectedCandidates(filteredCandidates.map(candidate => candidate));
    }
  };
  candidates.map(user=>console.log(user))
  const filteredCandidates = candidates.filter(candidate =>
    
    candidate.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    candidate.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    candidate.mobileno.includes(searchTerm)
  );
  console.log(candidates)
  return (
    <div style={{ overflow: 'hidden', width:"80vw" }}>
      <Container  className="px-0 ml-auto mr-auto mb-3" style={{ width: '95%' }}>
        <div className="table-responsive">
          <Table responsive bordered className="table"  >
            <thead style={{backgroundColor:'black'}}>
              <tr style={{backgroundColor:'#1f2c39'}}>
                <th style={{backgroundColor:'#1b74a8',color:'white'}}>
                  <Form.Check 
                    type="checkbox" 
                    checked={selectedCandidates.length === filteredCandidates.length && filteredCandidates.length!==0}
                    onChange={handleSelectAllCandidates}
                  />
                </th>
                <th style={{backgroundColor:'#1b74a8',color:'white'}}>Name</th>
                <th style={{backgroundColor:'#1b74a8',color:'white'}}>Email</th>
                <th style={{backgroundColor:'#1b74a8',color:'white'}}>Phone</th>
                <th style={{backgroundColor:'#1b74a8',color:'white'}}>Program</th>
                <th style={{backgroundColor:'#1b74a8',color:'white'}}>Domain</th>
                <th style={{backgroundColor:'#1b74a8',color:'white'}}>Batch No</th>
                <th style={{backgroundColor:'#1b74a8',color:'white'}}>Mode of Training</th>
                <th style={{backgroundColor:'#1b74a8',color:'white'}}>Mega Drive Status</th>
                <th style={{backgroundColor:'#1b74a8',color:'white'}}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCandidates.map(candidate => (
                <tr key={candidate._id}>
                  <td>
                    <Form.Check 
                      type="checkbox"
                      checked={selectedCandidates.includes(candidate)}
                      onChange={() => handleSelectCandidate(candidate)}
                    />
                  </td>
                  <td>{candidate.fullName}</td>
                  <td>{candidate.email}</td>
                  <td>{candidate.mobileno}</td>
                  <td>{candidate.program}</td>
                  <td>{candidate.domain}</td>
                  <td>{candidate.batchno}</td>
                  <td>{candidate.modeOfTraining}</td>
                  <td>{candidate.megadriveStatus}</td>
                  <td>
                    <Button 
                       style={{background:'transparent',border:'none',color:'green'}} 
                      onClick={() => handleAccept([candidate])}
                    >
                      <FaCheck className="me-1" /> Accept
                    </Button>
                    <Button 
                      style={{background:'transparent',border:'none',color:'red'}}
                      onClick={() => handleReject([candidate])}
                    >
                      <FaTimes className="me-1" /> Reject
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
            
          </Table>
          {(filteredCandidates.length===0) &&<p style={{textAlign:'center'}}>No registration requests</p>}
        </div>
        {selectedCandidates.length > 0 && 
          <div className="d-flex justify-content-end">
            <Button 
              style={{background:'transparent',border:'none',color:'green'}} 
              onClick={() => handleAccept(selectedCandidates)}
              disabled={selectedCandidates.length === 0}
            >
              <FaCheck className="me-1" /> Accept Selected
            </Button>
            <Button 
              style={{background:'transparent',border:'none',color:'red'}}
              onClick={() => handleReject(selectedCandidates)}
              disabled={selectedCandidates.length === 0}
            >
              <FaTimes className="me-1" /> Reject Selected
            </Button>
          </div>
        }
      </Container>
    </div>
  );
};

export default GuestRegistrationRequests;

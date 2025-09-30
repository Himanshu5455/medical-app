import Footer from '../components/layout/Footer';
import TriageOverview from '../components/triage/TriageOverview';
import PatientList from '../components/triage/PatientList';
import { useEffect, useState } from 'react';
import { getTriageBoard } from '../services/api';

const TriageManagement = () => {
  const [patientsList, setPatientsList] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await getTriageBoard();
        const mapStatus = (s) => ({
          awaiting: 'Awaiting Review',
          contacted: 'Pending',
          disengaged: 'Rejected',
          completed: 'Complete',
          ready_for_scheduling: 'Pending',
        })[s] || 'Pending';

        const mapPriority = (p) => ({
          High: 'High',
          Medium: 'Medium',
          Low: 'Low',
          Decline: 'Low',
        })[p] || 'Low';

        const normalizedNew = (result?.new ?? []).map((p) => ({
          id: p.id,
          name: p.name,
          age: p.age && p.age !== 'None' ? p.age : '-',
          status: mapStatus(p.status),
          priority: mapPriority(p.priority),
          referrer: p.partner ? 'Partner' : 'Self',
          entryDate: p.referral_date ? new Date(p.referral_date).toLocaleDateString() : '',
        }));

        setPatientsList(normalizedNew);
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, []);
 
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 container mx-auto px-4 py-6">
        <h1 className="text-4xl font-bold mb-6" style={{ color: '#3D3D3D' }}>Patient Triage Management</h1>
        <TriageOverview patients={patientsList}/>
        <PatientList patients={patientsList} />
      </main>
      <Footer />
    </div>
  );
};

export default TriageManagement;

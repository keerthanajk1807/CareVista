import { render, screen, waitFor, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import DoctorCard from '../Components/DoctorCard';
import DoctorsPage from '../pages/DoctorsPage';
import DoctorDetailsPage from '../pages/DoctorDetailsPage';
import BookAppointmentPage from '../pages/BookAppointmentPage';
import AppointmentsPage from '../pages/AppointmentsPage';
import useAppointmentContext from '../Components/context/useAppointmentContext';
import { fetchDoctors, fetchDoctorById, fetchDoctorAvailability } from '../api/doctorApi';
jest.mock('../api/api.js', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn()
  }
}));
jest.mock('../api/doctorApi', () => ({
  fetchDoctors: jest.fn(),
  fetchDoctorById: jest.fn(),
  fetchDoctorAvailability: jest.fn()
}));
jest.mock('../Components/context/useAppointmentContext', () => ({
  __esModule: true,
  default: jest.fn()
}));
const mockDispatch = jest.fn();
jest.mock('react-redux', () => ({
  useDispatch: () => mockDispatch,
  useSelector: selector => selector({
    appointments: {
      history: [],
      loading: false,
      error: null
    }
  })
}));
const doctor = {
  id: 1,
  name: 'Dr. Arun Kumar',
  specialty: 'Cardiologist',
  fee: 800,
  rating: 4.8,
  experience: 10,
  available: true,
  availableDays: ['Monday'],
  timeSlots: ['09:00 AM', '10:00 AM']
};
const second = {
  ...doctor,
  id: 2,
  name: 'Dr. Priya Sharma',
  specialty: 'Dermatologist'
};
const availability = {
  dates: ['2026-11-02'],
  slots: doctor.timeSlots,
  bookedSlots: []
};
let context;
function mount(element, url = '/') {
  return render(<MemoryRouter initialEntries={[url]}>{element}</MemoryRouter>);
}
beforeEach(() => {
  jest.clearAllMocks();
  context = {
    doctors: [doctor, second],
    appointments: [],
    loading: false,
    error: null,
    bookAppointment: jest.fn().mockResolvedValue({}),
    cancelAppointment: jest.fn().mockResolvedValue({}),
    rescheduleAppointment: jest.fn().mockResolvedValue({})
  };
  useAppointmentContext.mockImplementation(() => context);
  fetchDoctors.mockImplementation(async ({
    search = '',
    specialty = 'All'
  } = {}) => context.doctors.filter(d => (d.name + ' ' + d.specialty).toLowerCase().includes(search.toLowerCase()) && (specialty === 'All' || d.specialty === specialty)));
  fetchDoctorById.mockResolvedValue(doctor);
  fetchDoctorAvailability.mockResolvedValue(availability);
});
afterEach(cleanup);
test('doctor card shows information and calls profile handler', async () => {
  const click = jest.fn(),
    user = userEvent.setup();
  mount(<DoctorCard doctor={doctor} onViewProfile={click} />);
  expect(screen.getByText(doctor.name)).toBeInTheDocument();
  expect(screen.getByText(/Consultation Fee/)).toHaveTextContent('800');
  await user.click(screen.getByRole('button', {
    name: 'View Profile'
  }));
  expect(click).toHaveBeenCalledWith(doctor);
});
test('search and specialty filter update doctors', async () => {
  const user = userEvent.setup();
  mount(<DoctorsPage />);
  await screen.findByText(/Dr. Priya Sharma/);
  await user.type(screen.getByRole('textbox', {
    name: 'Search doctors'
  }), 'Arun');
  await waitFor(() => expect(screen.queryByText(/Dr. Priya Sharma/)).not.toBeInTheDocument());
  await user.clear(screen.getByRole('textbox', {
    name: 'Search doctors'
  }));
  await user.selectOptions(screen.getByLabelText('Specialty'), 'Dermatologist');
  await screen.findByText(/Dr. Priya Sharma/);
  await waitFor(() => expect(screen.queryByText(/Dr. Arun Kumar/)).not.toBeInTheDocument());
});
test('unmatched search shows empty state', async () => {
  const user = userEvent.setup();
  mount(<DoctorsPage />);
  await screen.findByText(/Dr. Arun Kumar/);
  await user.type(screen.getByLabelText('Search doctors'), 'zzzz');
  expect(await screen.findByText('No doctors found.')).toBeInTheDocument();
});
function profile() {
  return mount(<Routes><Route path='/doctor/:id' element={<DoctorDetailsPage />} /></Routes>, '/doctor/1');
}
test('doctor details show loading then API data', async () => {
  profile();
  expect(screen.getByRole('status')).toHaveTextContent('Loading');
  expect(await screen.findByRole('heading', {
    name: /Dr. Arun Kumar/
  })).toBeInTheDocument();
  expect(fetchDoctorById).toHaveBeenCalledWith('1');
});
test('doctor API failure displays error', async () => {
  fetchDoctorById.mockRejectedValueOnce(new Error('Doctors unavailable'));
  profile();
  expect(await screen.findByRole('alert')).toHaveTextContent('Doctors unavailable');
});
async function reachPatientForm(user) {
  mount(<BookAppointmentPage />);
  const select = screen.getByLabelText('Appointment date');
  await screen.findByRole('option', {
    name: '2026-11-02'
  });
  await user.selectOptions(select, '2026-11-02');
  await user.click(screen.getByRole('button', {
    name: 'Continue'
  }));
  await user.click(await screen.findByRole('button', {
    name: '09:00 AM'
  }));
  await user.click(screen.getByRole('button', {
    name: 'Continue'
  }));
}
async function review(user) {
  await reachPatientForm(user);
  await user.type(screen.getByLabelText('Patient Name'), 'Test Patient');
  await user.type(screen.getByLabelText('Phone Number'), '9876543210');
  await user.click(screen.getByRole('button', {
    name: 'Review Appointment'
  }));
}
test('date and time selection creates correct booking', async () => {
  const user = userEvent.setup();
  await review(user);
  expect(screen.getByRole('heading', {
    name: '4. Appointment Summary'
  })).toBeInTheDocument();
  await user.click(screen.getByRole('button', {
    name: 'Confirm Booking'
  }));
  expect(context.bookAppointment).toHaveBeenCalledWith(expect.objectContaining({
    doctorId: 1,
    date: '2026-11-02',
    time: '09:00 AM',
    patientName: 'Test Patient',
    phone: '9876543210'
  }));
  expect(await screen.findByText('Your appointment has been booked successfully!')).toBeInTheDocument();
});
test('booking validates date and patient phone', async () => {
  const user = userEvent.setup();
  mount(<BookAppointmentPage />);
  await user.click(screen.getByRole('button', {
    name: 'Continue'
  }));
  expect(screen.getByText('Please select an appointment date.')).toBeInTheDocument();
  cleanup();
  await reachPatientForm(user);
  await user.type(screen.getByLabelText('Patient Name'), 'Test Patient');
  await user.type(screen.getByLabelText('Phone Number'), '123');
  await user.click(screen.getByRole('button', {
    name: 'Review Appointment'
  }));
  expect(screen.getByText(/valid 10-digit phone/)).toBeInTheDocument();
  expect(context.bookAppointment).not.toHaveBeenCalled();
});
test('booked slots cannot be selected', async () => {
  fetchDoctorAvailability.mockResolvedValue({
    ...availability,
    bookedSlots: ['09:00 AM']
  });
  const user = userEvent.setup();
  mount(<BookAppointmentPage />);
  await screen.findByRole('option', {
    name: '2026-11-02'
  });
  await user.selectOptions(screen.getByLabelText('Appointment date'), '2026-11-02');
  await user.click(screen.getByRole('button', {
    name: 'Continue'
  }));
  expect(await screen.findByRole('button', {
    name: '09:00 AM'
  })).toBeDisabled();
});
test('booking failure does not show success', async () => {
  context.bookAppointment.mockRejectedValueOnce('Slot already booked');
  const user = userEvent.setup();
  await review(user);
  await user.click(screen.getByRole('button', {
    name: 'Confirm Booking'
  }));
  expect(await screen.findByText('Slot already booked')).toBeInTheDocument();
  expect(screen.queryByText('Your appointment has been booked successfully!')).not.toBeInTheDocument();
});
test('cancellation calls appointment action', async () => {
  context.appointments = [{
    id: 'a1',
    doctorName: doctor.name,
    patientName: 'Test Patient',
    date: '2026-11-02',
    time: '09:00 AM',
    status: 'Upcoming'
  }];
  const user = userEvent.setup();
  mount(<AppointmentsPage />);
  await user.click(screen.getByRole('button', {
    name: 'Cancel',
    exact: true
  }));
  expect(context.cancelAppointment).toHaveBeenCalledWith('a1');
});
test('appointment loading and error states are visible', () => {
  context.loading = true;
  context.error = 'Cannot load appointments';
  mount(<AppointmentsPage />);
  expect(screen.getByRole('status')).toHaveTextContent('Loading');
  expect(screen.getByRole('alert')).toHaveTextContent('Cannot load appointments');
});
test('search autofocus and fee/rating/availability filters work', async () => {
  const user = userEvent.setup();
  mount(<DoctorsPage />);
  expect(screen.getByLabelText('Search doctors')).toHaveFocus();
  await screen.findByText(/Dr. Arun Kumar/);
  await user.type(screen.getByLabelText('Maximum consultation fee'), '700');
  expect(screen.queryByText(/Dr. Arun Kumar/)).not.toBeInTheDocument();
  await user.click(screen.getByRole('button', {
    name: 'Clear Filters'
  }));
  await user.selectOptions(screen.getByLabelText('Minimum rating'), '4.8');
  expect(screen.getByText(/Dr. Arun Kumar/)).toBeInTheDocument();
  await user.selectOptions(screen.getByLabelText('Availability'), 'Unavailable');
  expect(await screen.findByText('No doctors found.')).toBeInTheDocument();
});
test('empty availability is explained', async () => {
  fetchDoctorAvailability.mockResolvedValue({
    ...availability,
    slots: []
  });
  const user = userEvent.setup();
  mount(<BookAppointmentPage />);
  await screen.findByRole('option', {
    name: '2026-11-02'
  });
  await user.selectOptions(screen.getByLabelText('Appointment date'), '2026-11-02');
  await user.click(screen.getByRole('button', {
    name: 'Continue'
  }));
  expect(await screen.findByText('No time slots available')).toBeInTheDocument();
});

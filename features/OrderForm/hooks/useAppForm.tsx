import { createFormHook } from '@tanstack/react-form-nextjs';
import CountrySelectField from '../components/FormFields/country-select';
import CustomersComboboxField from '../components/FormFields/customers-combobox';
import DateField from '../components/FormFields/date-field';
import InputField from '../components/FormFields/input';
import PlacesComboboxField from '../components/FormFields/places-combobox';
import SaveForm from '../components/FormFields/save-form';
import SelectField from '../components/FormFields/select-field';
import SinglePickComboboxField from '../components/FormFields/single-pick-combobox';
import { fieldContext, formContext } from '../context/form-context';

export const { useAppForm } = createFormHook({
  fieldComponents: {
    InputField,
    DateField,
    SelectField,
    SinglePickComboboxField,
    CustomersComboboxField,
    PlacesComboboxField,
    CountrySelectField,
  },
  formComponents: {
    SaveForm,
  },
  fieldContext,
  formContext,
});

import { createFormHook } from '@tanstack/react-form';
import { fieldContext, formContext } from '../context/form-context';
import TextField from '../components/FormFields/TextField';
import DateField from '../components/FormFields/DateField';
import PlaceField from '../components/FormFields/PlaceField';
import FormControls from '../components/FormFields/FormControls';
import SelectField from '../components/FormFields/SelectField';
import ComboboxField from '../components/FormFields/ComboboxField';

export const { useAppForm, withForm } = createFormHook({
  fieldComponents: {
    TextField,
    DateField,
    PlaceField,
    SelectField,
    ComboboxField,
  },
  formComponents: {
    FormControls,
  },
  fieldContext,
  formContext,
});

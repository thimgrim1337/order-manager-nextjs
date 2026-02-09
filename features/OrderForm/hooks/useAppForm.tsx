import {
  createFormHook,
  FieldApi,
  FormOptions,
} from '@tanstack/react-form-nextjs';
import { fieldContext, formContext } from '../context/form-context';
import InputField from '../components/FormFields/input';
import DateField from '../components/FormFields/date-field';
import PlaceField from '../components/FormFields/place-field';
import FormControls from '../components/FormFields/controls';
import SelectField from '../components/FormFields/select-field';
import ComboboxField from '../components/FormFields/combobox';

export const { useAppForm, withForm } = createFormHook({
  fieldComponents: {
    InputField,
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

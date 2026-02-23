import { createCitySchema, selectCitySchema } from '../dto/city.dto';
// import { serverValidation } from '../actions';
import { error, ok } from '../error';
import { checkIfCityExist, createCity } from '../dal/city.dal';
import z from 'zod';

export async function createCityService(rawData: unknown) {
  const validationResult = createCitySchema.safeParse(rawData);
  if (!validationResult.success)
    return error({
      reason: 'InvalidData',
      details: z.prettifyError(validationResult.error),
    });

  const isCityExist = await checkIfCityExist(validationResult.data);

  if (isCityExist)
    return error({
      reason: 'CityExist',
    });

  try {
    const dbCity = await createCity(validationResult.data);

    return ok(selectCitySchema.parse(dbCity));
  } catch (err) {
    return error({
      reason: 'UnexpectedError',
      details: err,
    });
  }
}

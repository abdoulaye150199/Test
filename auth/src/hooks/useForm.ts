import { useState, ChangeEvent, FocusEvent, FormEvent } from 'react';
import { z } from 'zod';

type FormFieldElement = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

interface UseFormProps<T> {
  values: T;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  handleChange: (e: ChangeEvent<FormFieldElement>) => void;
  handleBlur: (e: FocusEvent<FormFieldElement>) => Promise<void>;
  handleSubmit: (callback: (values: T) => void | Promise<void>) => (e: FormEvent<HTMLFormElement>) => Promise<void>;
}

export const useForm = <T extends Record<string, any>>(
  initialValues: T,
  validationSchema: z.ZodSchema
): UseFormProps<T> => {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const handleChange = (e: ChangeEvent<FormFieldElement>): void => {
    const { name, value } = e.target;
    const newValue = name === 'phoneNumber'
      ? value.replace(/\D/g, '').slice(0, 9)
      : value;

    setValues((prev) => ({
      ...prev,
      [name]: newValue,
    }));
    
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleBlur = async (e: FocusEvent<FormFieldElement>): Promise<void> => {
    const { name } = e.target;
    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));

    try {
      const result = validationSchema.safeParse(values);
      
      if (!result.success) {
        const fieldErrors = result.error.flatten().fieldErrors;
        const fieldError = fieldErrors[name as keyof typeof fieldErrors] as string[] | undefined;
        
        if (fieldError && fieldError.length > 0) {
          setErrors((prev) => ({
            ...prev,
            [name]: fieldError[0],
          }));
        } else {
          setErrors((prev) => ({
            ...prev,
            [name]: '',
          }));
        }
      } else {
        setErrors((prev) => ({
          ...prev,
          [name]: '',
        }));
      }
    } catch (error) {
    }
  };

  const validateForm = async (): Promise<boolean> => {
    try {
      validationSchema.parse(values);
      setErrors({});
      return true;
    } catch (error) {
      const newErrors: Record<string, string> = {};
      
      if (error instanceof z.ZodError) {
        const fieldErrors = error.flatten().fieldErrors;
        Object.entries(fieldErrors).forEach(([field, messages]) => {
          if (Array.isArray(messages) && messages.length > 0) {
            newErrors[field] = messages[0];
          }
        });
      }

      setTouched(
        Object.keys(values).reduce<Record<string, boolean>>((acc, key) => {
          acc[key] = true;
          return acc;
        }, {})
      );
      setErrors(newErrors);
      return false;
    }
  };

  const handleSubmit = (onSubmit: (values: T) => void | Promise<void>) => {
    return async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const isValid = await validateForm();
      if (isValid) {
        await onSubmit(values);
      }
    };
  };

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    handleSubmit,
  };
};

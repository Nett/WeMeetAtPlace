import { registerDecorator, ValidationArguments, ValidationOptions } from 'class-validator';
  
  export function Match<T = any>(
    property: keyof T,
    validationOptions?: ValidationOptions,
  ) {
    return function (object: object, propertyName: string) {
      registerDecorator({
        name: 'Match',
        target: object.constructor,
        propertyName,
        constraints: [property as string],
        options: validationOptions,
        validator: {
          validate(value: unknown, args: ValidationArguments) {
            const [relatedPropertyName] = args.constraints;
            const relatedValue = (args.object as Record<string, unknown>)[relatedPropertyName];
            return value === relatedValue;
          },
        },
      });
    };
  }
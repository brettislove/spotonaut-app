"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import LocationInput from "./ui/location-input";
import { FieldHelpNew } from "./ui/field-help-new";
import type { LocationData } from "@/lib/types/analysis";

const formSchema = z.object({
  location: z.string().nonempty("Je nutné zadat cílovou lokalitu."),
  businessType: z.string().nonempty("Je nutné zadat typ podnikání."),
});

export default function AnalysisFormNew() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      location: "",
      businessType: "",
    },
  });

  const [locationInput, setLocationInput] = React.useState("");
  const [fullLocationData, setFullLocationData] =
    React.useState<LocationData | null>(null);
  const [errors, setErrors] = React.useState<Partial<Record<string, string>>>(
    {},
  );

  function onSubmit(data: z.infer<typeof formSchema>) {
    toast("You submitted the following values:", {
      description: (
        <pre className="bg-code text-code-foreground mt-2 w-[320px] overflow-x-auto rounded-md p-4">
          <code>{JSON.stringify(data, null, 2)}</code>
        </pre>
      ),
      position: "bottom-right",
      classNames: {
        content: "flex flex-col gap-2",
      },
      style: {
        "--border-radius": "calc(var(--radius)  + 4px)",
      } as React.CSSProperties,
    });
  }

  return (
    <>
      <Card className="w-full max-w-xl mx-auto bg-gradient-to-br from-primary-900/60 via-slate-900/70 to-secondar-900/60 backdrop-blur-sm border border-slate-700/60 shadow-2xl">
        <CardHeader>
          <CardTitle className="text-2xl text-center">
            Analýza lokality
          </CardTitle>
          <CardDescription className="text-center mt-2">
            Vyplňte základní informace o vašem podnikání potřebné pro analýzu.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form id="analysis-form" onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup>
              <Controller
                name="location"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="analysis-form-location">
                      Cílová lokalita
                      <FieldHelpNew
                        title="Cílová lokalita"
                        description="Zadejte přesnou adresu nebo název místa. Můžete použít vyhledávání nebo vybrat lokaci z mapy. Pro nejlepší výsledky zadejte město a ulici."
                      />
                    </FieldLabel>
                    <LocationInput
                      field={field}
                      fieldState={fieldState}
                      locationInput={locationInput}
                      setLocationInput={setLocationInput}
                      fullLocationData={fullLocationData}
                      setFullLocationData={setFullLocationData}
                      errors={errors}
                      setErrors={setErrors}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="businessType"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="analysis-form-description">
                      Popis podnikání
                    </FieldLabel>
                    <InputGroup>
                      <InputGroupTextarea
                        {...field}
                        id="analysis-form-description"
                        placeholder="I'm having an issue with the login button on mobile."
                        rows={6}
                        className="min-h-24 resize-none"
                        aria-invalid={fieldState.invalid}
                      />
                      <InputGroupAddon align="block-end">
                        <InputGroupText className="tabular-nums">
                          {field.value.length}/100 characters
                        </InputGroupText>
                      </InputGroupAddon>
                    </InputGroup>
                    <FieldDescription>
                      Include steps to reproduce, expected behavior, and what
                      actually happened.
                    </FieldDescription>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </FieldGroup>
          </form>
        </CardContent>
        <CardFooter>
          <Field
            orientation="horizontal"
            className="w-full justify-center gap-2"
          >
            <Button
              type="button"
              variant="outline"
              onClick={() => form.reset()}
            >
              Vymazat
            </Button>
            <Button
              type="submit"
              form="analysis-form"
              className="bg-gradient-to-br from-blue-500 via-blue-600/100 to-blue-800"
            >
              Spustit analýzu
            </Button>
          </Field>
        </CardFooter>
      </Card>
    </>
  );
}

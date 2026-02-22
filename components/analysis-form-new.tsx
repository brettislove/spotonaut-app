"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import LocationInput from "./ui/location-input";
import { FieldHelpNew } from "./ui/field-help-new";
import type { AnalysisFormData, LocationData } from "@/lib/types/analysis";
import { BusinessTypeSelectNew } from "./ui/business-type-select-new";
import { ShimmerButton } from "./ui/shimmer-button";
import OperatingDays from "./operating-days";
import {
  ChainOfThought,
  ChainOfThoughtContent,
  ChainOfThoughtHeader,
  ChainOfThoughtStep,
} from "./ai-elements/chain-of-thought";
import { Check, CheckCheck, MapPin, MapPinned, Store } from "lucide-react";
import { getBusinessTypeByName } from "@/lib/constants/business-types";
import { useAnalysis } from "@/lib/contexts/analysis-context";
import { ProgressStep } from "@/lib/types/analysis";

const formSchema = z.object({
  location: z.string().nonempty("Je nutné zadat cílovou lokalitu."),
  businessType: z.string().nonempty("Je nutné zadat typ podnikání."),
  operatingHours: z.string().optional(),
});

export default function AnalysisFormNew({
  handleAnalysisSubmit,
  progressStep = "geocoding",
}: {
  handleAnalysisSubmit: (data: AnalysisFormData) => Promise<void>;
  progressStep?: ProgressStep;
}) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      location: "",
      businessType: "",
      operatingHours: "",
    },
  });

  const {
    isAnalyzing,
    hasCompletedAnalysis,
    resetAnalysis,
    clearRestoredState,
  } = useAnalysis();
  const [locationInput, setLocationInput] = React.useState("");
  const [fullLocationData, setFullLocationData] =
    React.useState<LocationData | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = React.useState(false);
  const [pendingFormData, setPendingFormData] =
    React.useState<AnalysisFormData | null>(null);

  // Helper function to determine step status based on current progress
  const getStepStatus = (
    stepName: ProgressStep,
  ): "pending" | "active" | "complete" => {
    const stepOrder: ProgressStep[] = [
      "geocoding",
      "maps_grounding",
      "pro_analysis",
      "finalizing",
      "complete",
    ];
    const currentIndex = stepOrder.indexOf(progressStep);
    const stepIndex = stepOrder.indexOf(stepName);

    if (stepIndex < currentIndex) return "complete";
    if (stepIndex === currentIndex) return "active";
    return "pending";
  };

  function onSubmit(data: z.infer<typeof formSchema>) {
    // Use full location data if available, otherwise fall back to input
    const businessType = getBusinessTypeByName(data.businessType);
    const formData: AnalysisFormData = {
      location: data.location,
      businessType: businessType!,
      coordinates: fullLocationData
        ? {
            lat: fullLocationData.coordinates.lat,
            lon: fullLocationData.coordinates.lon,
          }
        : undefined,
    };

    // Check if there's already a completed analysis
    if (hasCompletedAnalysis) {
      setPendingFormData(formData);
      setShowConfirmDialog(true);
      return;
    }

    // No existing analysis, proceed directly
    handleAnalysisSubmit(formData);
  }

  function handleConfirmNewAnalysis() {
    if (pendingFormData) {
      resetAnalysis();
      clearRestoredState();
      setShowConfirmDialog(false);
      handleAnalysisSubmit(pendingFormData);
      setPendingFormData(null);
    }
  }

  return (
    <>
      <Card className="w-full max-w-xl mx-auto bg-gradient-to-br from-primary-900/60 via-slate-900/70 to-secondar-900/60 backdrop-blur-sm border border-slate-700/60 shadow-2xl">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Data k analýze</CardTitle>
          <CardDescription className="text-center mt-2">
            Vyplňte základní informace o vašem podnikání potřebné pro analýzu.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!isAnalyzing ? (
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
                      <FieldLabel htmlFor="analysis-form-businessType">
                        Typ podnikání
                        <FieldHelpNew
                          title="Typ podnikání"
                          description="Vyberte typ podnikání, který nejlépe vystihuje vaši provozovnu. Tento výběr pomůže přizpůsobit odhad návštěvnosti a doporučené provozní parametry."
                        />
                      </FieldLabel>
                      <BusinessTypeSelectNew
                        value={field.value}
                        onValueChange={field.onChange}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
                <Controller
                  name="operatingHours"
                  control={form.control}
                  render={({ fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="analysis-form-operatingHours">
                        Plánované dny otevření
                        <FieldHelpNew
                          title="Plánované dny otevření"
                          description="Vyberte dny, kdy bude provozovna otevřená a nastavte počet hodin pro každý den. Celkové hodiny za týden se vypočtou z vybraných dnů."
                        />
                      </FieldLabel>
                      <div className="relative">
                        {/* Keep component in DOM but visually disabled (planned feature) */}
                        <div className="pointer-events-none opacity-40">
                          <OperatingDays disabled={true} onChange={() => {}} />
                        </div>

                        {/* Small overlay label indicating planned feature */}
                        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                          Dostupné brzy...
                        </div>
                      </div>
                    </Field>
                  )}
                />
              </FieldGroup>
              <div className="mt-6">
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
                  <ShimmerButton
                    type="submit"
                    className="cursor-pointer bg-secondary text-black"
                  >
                    Spustit analýzu
                  </ShimmerButton>
                </Field>
              </div>
            </form>
          ) : (
            <ChainOfThought defaultOpen>
              <ChainOfThoughtHeader>
                <h3 className="text-2xl">Probíhá analýza vaší lokality...</h3>
              </ChainOfThoughtHeader>
              <ChainOfThoughtContent>
                <ChainOfThoughtStep
                  icon={
                    getStepStatus("geocoding") === "complete" ? Check : MapPin
                  }
                  label="Geokódování zadané lokality"
                  status={getStepStatus("geocoding")}
                />

                <ChainOfThoughtStep
                  icon={
                    getStepStatus("maps_grounding") === "complete"
                      ? Check
                      : MapPinned
                  }
                  label="Získávání dat z map"
                  status={getStepStatus("maps_grounding")}
                />

                <ChainOfThoughtStep
                  icon={
                    getStepStatus("pro_analysis") === "complete" ? Check : Store
                  }
                  label="Analýza obchodního potenciálu"
                  status={getStepStatus("pro_analysis")}
                />

                <ChainOfThoughtStep
                  label="Sumarizace výsledků"
                  status={getStepStatus("finalizing")}
                />

                {getStepStatus("complete") === "complete" && (
                  <ChainOfThoughtStep
                    icon={CheckCheck}
                    label="Hotovo!"
                    status={getStepStatus("complete")}
                  />
                )}
              </ChainOfThoughtContent>
            </ChainOfThought>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={showConfirmDialog}
        onOpenChange={setShowConfirmDialog}
        title="Přepsat existující analýzu?"
        description="Již máte dokončenou analýzu. Spuštěním nové analýzy bude stávající analýza odstraněna. Chcete pokračovat?"
        onConfirm={handleConfirmNewAnalysis}
      />
    </>
  );
}

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
import { useLocale } from "@/hooks/use-locale";

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
  const { t } = useLocale();
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
          <CardTitle className="text-2xl text-center">
            {t("analysisForm.card.title")}
          </CardTitle>
          <CardDescription className="text-center mt-2">
            {t("analysisForm.card.description")}
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
                        {t("analysisForm.fields.location.label")}
                        <FieldHelpNew
                          title={t("analysisForm.fields.location.helpTitle")}
                          description={t(
                            "analysisForm.fields.location.helpDescription",
                          )}
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
                        {t("analysisForm.fields.businessType.label")}
                        <FieldHelpNew
                          title={t(
                            "analysisForm.fields.businessType.helpTitle",
                          )}
                          description={t(
                            "analysisForm.fields.businessType.helpDescription",
                          )}
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
                        {t("analysisForm.fields.operatingHours.label")}
                        <FieldHelpNew
                          title={t(
                            "analysisForm.fields.operatingHours.helpTitle",
                          )}
                          description={t(
                            "analysisForm.fields.operatingHours.helpDescription",
                          )}
                        />
                      </FieldLabel>
                      <div className="relative">
                        {/* Keep component in DOM but visually disabled (planned feature) */}
                        <div className="pointer-events-none opacity-40">
                          <OperatingDays disabled={true} onChange={() => {}} />
                        </div>

                        {/* Small overlay label indicating planned feature */}
                        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                          {t("analysisForm.operatingSoon")}
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
                    {t("analysisForm.buttons.clear")}
                  </Button>
                  <ShimmerButton
                    type="submit"
                    className="cursor-pointer bg-secondary text-black"
                  >
                    {t("analysisForm.buttons.submit")}
                  </ShimmerButton>
                </Field>
              </div>
            </form>
          ) : (
            <ChainOfThought defaultOpen>
              <ChainOfThoughtHeader>
                <h3 className="text-2xl">
                  {t("analysisForm.chain.processing")}
                </h3>
              </ChainOfThoughtHeader>
              <ChainOfThoughtContent>
                <ChainOfThoughtStep
                  icon={
                    getStepStatus("geocoding") === "complete" ? Check : MapPin
                  }
                  label={t("analysisForm.chain.steps.geocoding")}
                  status={getStepStatus("geocoding")}
                />

                <ChainOfThoughtStep
                  icon={
                    getStepStatus("maps_grounding") === "complete"
                      ? Check
                      : MapPinned
                  }
                  label={t("analysisForm.chain.steps.mapsGrounding")}
                  status={getStepStatus("maps_grounding")}
                />

                <ChainOfThoughtStep
                  icon={
                    getStepStatus("pro_analysis") === "complete" ? Check : Store
                  }
                  label={t("analysisForm.chain.steps.proAnalysis")}
                  status={getStepStatus("pro_analysis")}
                />

                <ChainOfThoughtStep
                  label={t("analysisForm.chain.steps.finalizing")}
                  status={getStepStatus("finalizing")}
                />

                {getStepStatus("complete") === "complete" && (
                  <ChainOfThoughtStep
                    icon={CheckCheck}
                    label={t("analysisForm.chain.steps.completeLabel")}
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
        title={t("analysisForm.confirm.title")}
        description={t("analysisForm.confirm.description")}
        confirmText={t("analysisForm.confirm.confirmButton")}
        onConfirm={handleConfirmNewAnalysis}
      />
    </>
  );
}

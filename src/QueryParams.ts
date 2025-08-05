const urlParams = new URLSearchParams(window.location.search);

function GetString(parameterName: string): string | null {
  return urlParams.get(parameterName);
}

function GetNumber(parameterName: string): number | null {
  const value = urlParams.get(parameterName);
  if (value) {
    return Number(value);
  }
  return null;
}

function GetBoolean(parameterName: string): boolean {
  const value = urlParams.get(parameterName);
  return value != null && (value.toLocaleLowerCase() == "true" || Boolean(Number(value)));
}

export const QueryParams = {
  GetString,
  GetNumber,
  GetBoolean,
}
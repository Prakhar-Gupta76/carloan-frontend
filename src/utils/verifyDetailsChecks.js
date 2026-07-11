const NOT_FOUND_STATUS = 'not found';
const CREDIT_TYPE = 'CREDIT';
const SALARY_DESCRIPTION_PREFIX = 'salary credited';

function normalizeText(value) {
  return String(value || '').trim().toLowerCase();
}

function getMonthIndex(date) {
  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return null;
  }

  return parsedDate.getFullYear() * 12 + parsedDate.getMonth();
}

function hasConsecutiveMonthlyCredits(pfCredits, count) {
  const topCredits = pfCredits.slice(0, count);

  if (topCredits.length < count) {
    return false;
  }

  for (let index = 1; index < topCredits.length; index += 1) {
    const previousMonthIndex = getMonthIndex(topCredits[index - 1].date);
    const currentMonthIndex = getMonthIndex(topCredits[index].date);

    if (
      previousMonthIndex === null ||
      currentMonthIndex === null ||
      previousMonthIndex - currentMonthIndex !== 1
    ) {
      return false;
    }
  }

  return true;
}

function getTopCompanyFrequency(pfCredits) {
  const firstCompany = normalizeText(pfCredits[0]?.company);

  if (!firstCompany) {
    return 0;
  }

  let frequency = 0;

  for (const pfCredit of pfCredits) {
    if (normalizeText(pfCredit.company) !== firstCompany) {
      break;
    }

    frequency += 1;
  }

  return frequency;
}

function hasSameCompanyForTopDuration(pfCredits, duration) {
  if (!duration || pfCredits.length < duration) {
    return false;
  }

  const topCredits = pfCredits.slice(0, duration);
  const firstCompany = normalizeText(topCredits[0]?.company);

  if (!firstCompany) {
    return false;
  }

  return topCredits.every(
    (pfCredit) => normalizeText(pfCredit.company) === firstCompany,
  );
}

function getTopThreeSalaryCredits(transactions) {
  return transactions
    .filter(
      (transaction) =>
        normalizeText(transaction.type).toUpperCase() === CREDIT_TYPE &&
        normalizeText(transaction.description).startsWith(
          SALARY_DESCRIPTION_PREFIX,
        ),
    )
    .slice(0, 3);
}

function createCheck(key, label, passed, message, value = '-') {
  return {
    key,
    label,
    message,
    passed,
    value,
  };
}

export function getVerifyDetailsChecks(user) {
  if (!user) {
    return {
      allChecksPassed: false,
      checks: [],
      failedChecks: [],
    };
  }

  const age = user.age;
  const salary = user.salary;
  const currentCompanyDuration = user.current_company_duration;
  const loanAmount = user.loan_amount;
  const loanTenure = user.loan_tenure;
  const loanMonthlyEmi = user.loan_monthly_emi;
  const pfCredits = user.epfo_response?.data?.pf_credits ?? [];
  const transactions =
    user.account_aggregator_response?.data?.transactions ?? [];
  const creditScore =
    user.credit_bureau_credit_score_response?.data?.credit_score;
  const existingEmis =
    user.credit_bureau_existing_emis_response?.data?.existing_emis_amount;
  const topCompanyFrequency = getTopCompanyFrequency(pfCredits);
  const topThreeSalaryCredits = getTopThreeSalaryCredits(transactions);
  const minimumSalaryCredit =
    topThreeSalaryCredits.length === 3
      ? Math.min(...topThreeSalaryCredits.map((transaction) => transaction.amount))
      : null;

  const checks = [
    createCheck(
      'age-validated',
      'Age',
      true,
      'Age is validated.',
      age ?? '-',
    ),
  ];

  const currentCompanyDurationPassed =
    Boolean(currentCompanyDuration) &&
    currentCompanyDuration >= topCompanyFrequency &&
    hasSameCompanyForTopDuration(pfCredits, currentCompanyDuration);

  checks.push(
    createCheck(
      'company-duration',
      'Current Company Duration',
      currentCompanyDurationPassed,
      currentCompanyDurationPassed
        ? 'Current company duration is validated.'
        : 'Provided company duration is incorrect.',
      currentCompanyDuration ?? '-',
    ),
  );

  const consecutiveMonthlyCreditsPassed =
    pfCredits.length >= 6 && hasConsecutiveMonthlyCredits(pfCredits, 6);

  checks.push(
    createCheck(
      'pf-credit-continuity',
      'Employment Credit Continuity',
      consecutiveMonthlyCreditsPassed,
      consecutiveMonthlyCreditsPassed
        ? 'Employment credits are available for consecutive months.'
        : 'Not eligible for the loan.',
      pfCredits.length,
    ),
  );

  const panPassed =
    normalizeText(user.account_aggregator_response?.status) !==
    NOT_FOUND_STATUS &&
    normalizeText(user.epfo_response?.status) !== NOT_FOUND_STATUS;

  checks.push(
    createCheck(
      'pan',
      'PAN',
      panPassed,
      panPassed
        ? 'PAN details are validated.'
        : 'Provided PAN Number is incorrect.',
      user.pan || '-',
    ),
  );

  const salaryPassed =
    minimumSalaryCredit !== null && salary !== null && minimumSalaryCredit >= salary;

  checks.push(
    createCheck(
      'salary',
      'Salary',
      salaryPassed,
      salaryPassed
        ? 'Salary is validated.'
        : 'Salary provided is incorrect.',
      salary ?? '-',
    ),
  );

  const creditScorePassed = creditScore !== null && creditScore >= 650;

  checks.push(
    createCheck(
      'credit-score',
      'Credit Score',
      creditScorePassed,
      creditScorePassed
        ? 'Credit score is eligible.'
        : 'Loan cannot be processed due to Low Credit Score.',
      creditScore ?? '-',
    ),
  );

  const ageTenurePassed =
    age !== null && loanTenure !== null && age + loanTenure <= 60;

  checks.push(
    createCheck(
      'age-tenure',
      'Age + Loan Tenure',
      ageTenurePassed,
      ageTenurePassed
        ? 'Age and loan tenure are eligible.'
        : 'Loan cannot be processed due to Age. You can lower the tenure to avail a loan.',
      loanTenure ?? '-',
    ),
  );

  const repaymentRatio =
    existingEmis !== null && loanMonthlyEmi !== null && salary
      ? (existingEmis + loanMonthlyEmi) / salary
      : null;
  const repaymentCapacityPassed =
    repaymentRatio !== null && repaymentRatio <= 0.6;

  checks.push(
    createCheck(
      'repayment-capacity',
      'Existing EMIs + Loan EMI',
      repaymentCapacityPassed,
      repaymentCapacityPassed
        ? 'Repayment capacity is eligible.'
        : 'Loan cannot be processed. Salary is not enough. You can lower the loan amount to avail a Loan.',
      repaymentRatio !== null ? `${Math.round(repaymentRatio * 100)}%` : '-',
    ),
  );

  const failedChecks = checks.filter((check) => !check.passed);

  return {
    allChecksPassed: failedChecks.length === 0,
    checks,
    failedChecks,
    summary: {
      age,
      creditScore,
      currentCompanyDuration,
      existingEmis,
      loanAmount,
      loanMonthlyEmi,
      loanTenure,
      salary,
    },
  };
}

import ImageAuditSystem from './images_audit.ts';

async function runAudit() {
  const audit = new ImageAuditSystem();
  
  console.log('=== COMPREHENSIVE IMAGE AUDIT SYSTEM ===\n');
  
  // Run audit
  const { results, summary } = await audit.runFullAudit();
  
  // Generate and save report
  const report = audit.generateReport();
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const reportPath = `scripts/audit_reports/image_audit_${timestamp}.md`;
  
  const fs = await import('fs');
  fs.writeFileSync(reportPath, report);
  console.log(`\nDetailed report saved to: ${reportPath}`);
  
  // Show summary
  console.log('\n=== AUDIT SUMMARY ===');
  console.log(`Total Meals: ${summary.totalMeals}`);
  console.log(`Total Images Available: ${summary.totalImages}`);
  console.log(`Issues Found:`);
  console.log(`  - Missing Files: ${summary.issuesFound.missingFiles}`);
  console.log(`  - Wrong Paths: ${summary.issuesFound.wrongPaths}`);
  console.log(`  - Duplicates: ${summary.issuesFound.duplicates}`);
  console.log(`  - Poor Matches: ${summary.issuesFound.mismatches}`);
  console.log(`Fixable Issues: ${summary.fixableIssues}`);
  console.log(`Unfixable Issues: ${summary.unfixableIssues}`);
  
  // SAFETY: All automation is now frozen to dry-run only
  // This prevents the catastrophic automated overwrites that destroyed 448 recipes
  console.log('\n🚨 AUTOMATION SAFETY: All fixes disabled to protect manual work');
  console.log('📋 AUDIT COMPLETE - Review above suggestions manually');
  console.log('🔒 To apply changes: Use individual surgical fixes only');
  console.log('❌ No batch automated fixes allowed to prevent regressions');
  
  // Save suggestions for manual review using existing results
  const suggestionPath = `scripts/audit_reports/suggestions_${timestamp}.json`;
  const suggestionData = {
    timestamp: new Date().toISOString(),
    totalIssues: summary.fixableIssues + summary.unfixableIssues,
    safetyNote: "All automation disabled. Manual surgical fixes only.",
    results: results.filter(r => r.suggestedFix).map(r => ({
      mealId: r.mealId,
      mealName: r.mealName,
      currentImage: r.currentImageUrl,
      issues: r.issues,
      suggestion: r.suggestedFix
    }))
  };
  
  fs.writeFileSync(suggestionPath, JSON.stringify(suggestionData, null, 2));
  console.log(`💡 Manual review suggestions saved to: ${suggestionPath}`);
  
  // REMOVED: All automated fixing capabilities to prevent disasters
  // Previous --fix and --no-dry-run flags disabled permanently
}

runAudit().catch(console.error);
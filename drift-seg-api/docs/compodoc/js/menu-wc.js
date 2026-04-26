'use strict';

customElements.define('compodoc-menu', class extends HTMLElement {
    constructor() {
        super();
        this.isNormalMode = this.getAttribute('mode') === 'normal';
    }

    connectedCallback() {
        this.render(this.isNormalMode);
    }

    render(isNormalMode) {
        let tp = lithtml.html(`
        <nav>
            <ul class="list">
                <li class="title">
                    <a href="index.html" data-type="index-link">Drift Seg API</a>
                </li>

                <li class="divider"></li>
                ${ isNormalMode ? `<div id="book-search-input" role="search"><input type="text" placeholder="Type to search"></div>` : '' }
                <li class="chapter">
                    <a data-type="chapter-link" href="index.html"><span class="icon ion-ios-home"></span>Getting started</a>
                    <ul class="links">
                                <li class="link">
                                    <a href="overview.html" data-type="chapter-link">
                                        <span class="icon ion-ios-keypad"></span>Overview
                                    </a>
                                </li>

                            <li class="link">
                                <a href="index.html" data-type="chapter-link">
                                    <span class="icon ion-ios-paper"></span>
                                        README
                                </a>
                            </li>
                                <li class="link">
                                    <a href="dependencies.html" data-type="chapter-link">
                                        <span class="icon ion-ios-list"></span>Dependencies
                                    </a>
                                </li>
                                <li class="link">
                                    <a href="properties.html" data-type="chapter-link">
                                        <span class="icon ion-ios-apps"></span>Properties
                                    </a>
                                </li>

                    </ul>
                </li>
                    <li class="chapter modules">
                        <a data-type="chapter-link" href="modules.html">
                            <div class="menu-toggler linked" data-bs-toggle="collapse" ${ isNormalMode ?
                                'data-bs-target="#modules-links"' : 'data-bs-target="#xs-modules-links"' }>
                                <span class="icon ion-ios-archive"></span>
                                <span class="link-name">Modules</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                        </a>
                        <ul class="links collapse " ${ isNormalMode ? 'id="modules-links"' : 'id="xs-modules-links"' }>
                            <li class="link">
                                <a href="modules/CommonModule.html" data-type="entity-link" >CommonModule</a>
                            </li>
                            <li class="link">
                                <a href="modules/CustomerModule.html" data-type="entity-link" >CustomerModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-CustomerModule-38fb11a75cf4a1b147299b5d425d9e1a6c3b5262114e5bd7bac5a3464c9058dde6fdc57283ced8960f3dd532826087d3c81445794379cd4f6adfdf6259897f72"' : 'data-bs-target="#xs-controllers-links-module-CustomerModule-38fb11a75cf4a1b147299b5d425d9e1a6c3b5262114e5bd7bac5a3464c9058dde6fdc57283ced8960f3dd532826087d3c81445794379cd4f6adfdf6259897f72"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-CustomerModule-38fb11a75cf4a1b147299b5d425d9e1a6c3b5262114e5bd7bac5a3464c9058dde6fdc57283ced8960f3dd532826087d3c81445794379cd4f6adfdf6259897f72"' :
                                            'id="xs-controllers-links-module-CustomerModule-38fb11a75cf4a1b147299b5d425d9e1a6c3b5262114e5bd7bac5a3464c9058dde6fdc57283ced8960f3dd532826087d3c81445794379cd4f6adfdf6259897f72"' }>
                                            <li class="link">
                                                <a href="controllers/CustomerController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >CustomerController</a>
                                            </li>
                                            <li class="link">
                                                <a href="controllers/TransactionController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >TransactionController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-CustomerModule-38fb11a75cf4a1b147299b5d425d9e1a6c3b5262114e5bd7bac5a3464c9058dde6fdc57283ced8960f3dd532826087d3c81445794379cd4f6adfdf6259897f72"' : 'data-bs-target="#xs-injectables-links-module-CustomerModule-38fb11a75cf4a1b147299b5d425d9e1a6c3b5262114e5bd7bac5a3464c9058dde6fdc57283ced8960f3dd532826087d3c81445794379cd4f6adfdf6259897f72"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-CustomerModule-38fb11a75cf4a1b147299b5d425d9e1a6c3b5262114e5bd7bac5a3464c9058dde6fdc57283ced8960f3dd532826087d3c81445794379cd4f6adfdf6259897f72"' :
                                        'id="xs-injectables-links-module-CustomerModule-38fb11a75cf4a1b147299b5d425d9e1a6c3b5262114e5bd7bac5a3464c9058dde6fdc57283ced8960f3dd532826087d3c81445794379cd4f6adfdf6259897f72"' }>
                                        <li class="link">
                                            <a href="injectables/CustomerRepository.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >CustomerRepository</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/CustomerService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >CustomerService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/TransactionRepository.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >TransactionRepository</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/TransactionService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >TransactionService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/DatabaseModule.html" data-type="entity-link" >DatabaseModule</a>
                            </li>
                            <li class="link">
                                <a href="modules/SegmentModule.html" data-type="entity-link" >SegmentModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-SegmentModule-8af36b668c6098ce48560e6a55f56fce6e1a0786033e761c8bfb6ded00b6797685200260515f211e32817979d04652a082c3c81d79d22b6987cda4163b29987a"' : 'data-bs-target="#xs-controllers-links-module-SegmentModule-8af36b668c6098ce48560e6a55f56fce6e1a0786033e761c8bfb6ded00b6797685200260515f211e32817979d04652a082c3c81d79d22b6987cda4163b29987a"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-SegmentModule-8af36b668c6098ce48560e6a55f56fce6e1a0786033e761c8bfb6ded00b6797685200260515f211e32817979d04652a082c3c81d79d22b6987cda4163b29987a"' :
                                            'id="xs-controllers-links-module-SegmentModule-8af36b668c6098ce48560e6a55f56fce6e1a0786033e761c8bfb6ded00b6797685200260515f211e32817979d04652a082c3c81d79d22b6987cda4163b29987a"' }>
                                            <li class="link">
                                                <a href="controllers/SegmentController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >SegmentController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-SegmentModule-8af36b668c6098ce48560e6a55f56fce6e1a0786033e761c8bfb6ded00b6797685200260515f211e32817979d04652a082c3c81d79d22b6987cda4163b29987a"' : 'data-bs-target="#xs-injectables-links-module-SegmentModule-8af36b668c6098ce48560e6a55f56fce6e1a0786033e761c8bfb6ded00b6797685200260515f211e32817979d04652a082c3c81d79d22b6987cda4163b29987a"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-SegmentModule-8af36b668c6098ce48560e6a55f56fce6e1a0786033e761c8bfb6ded00b6797685200260515f211e32817979d04652a082c3c81d79d22b6987cda4163b29987a"' :
                                        'id="xs-injectables-links-module-SegmentModule-8af36b668c6098ce48560e6a55f56fce6e1a0786033e761c8bfb6ded00b6797685200260515f211e32817979d04652a082c3c81d79d22b6987cda4163b29987a"' }>
                                        <li class="link">
                                            <a href="injectables/CreateSegmentFacade.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >CreateSegmentFacade</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/CustomerActivityRepository.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >CustomerActivityRepository</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/CustomerRepository.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >CustomerRepository</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/SegmentDeltaNotifierService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >SegmentDeltaNotifierService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/SegmentDeltaRepository.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >SegmentDeltaRepository</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/SegmentMembershipFacade.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >SegmentMembershipFacade</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/SegmentMembershipRepository.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >SegmentMembershipRepository</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/SegmentMembershipSchedulerService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >SegmentMembershipSchedulerService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/SegmentMembershipService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >SegmentMembershipService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/SegmentPendingEventQueueService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >SegmentPendingEventQueueService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/SegmentRepository.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >SegmentRepository</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/SegmentRuleEvaluatorService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >SegmentRuleEvaluatorService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/SegmentSearchIndexerService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >SegmentSearchIndexerService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/SegmentService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >SegmentService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                </ul>
                </li>
                        <li class="chapter">
                            <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#controllers-links"' :
                                'data-bs-target="#xs-controllers-links"' }>
                                <span class="icon ion-md-swap"></span>
                                <span>Controllers</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                            <ul class="links collapse " ${ isNormalMode ? 'id="controllers-links"' : 'id="xs-controllers-links"' }>
                                <li class="link">
                                    <a href="controllers/CustomerController.html" data-type="entity-link" >CustomerController</a>
                                </li>
                                <li class="link">
                                    <a href="controllers/SegmentController.html" data-type="entity-link" >SegmentController</a>
                                </li>
                                <li class="link">
                                    <a href="controllers/TransactionController.html" data-type="entity-link" >TransactionController</a>
                                </li>
                            </ul>
                        </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#classes-links"' :
                            'data-bs-target="#xs-classes-links"' }>
                            <span class="icon ion-ios-paper"></span>
                            <span>Classes</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="classes-links"' : 'id="xs-classes-links"' }>
                            <li class="link">
                                <a href="classes/AbstractDocument.html" data-type="entity-link" >AbstractDocument</a>
                            </li>
                            <li class="link">
                                <a href="classes/AbstractRepository.html" data-type="entity-link" >AbstractRepository</a>
                            </li>
                            <li class="link">
                                <a href="classes/CreateCustomerDto.html" data-type="entity-link" >CreateCustomerDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/CreateSegmentDto.html" data-type="entity-link" >CreateSegmentDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/CreateTransactionDto.html" data-type="entity-link" >CreateTransactionDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/CustomerDocument.html" data-type="entity-link" >CustomerDocument</a>
                            </li>
                            <li class="link">
                                <a href="classes/CustomerResponseDto.html" data-type="entity-link" >CustomerResponseDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/SegmentDeltaDocument.html" data-type="entity-link" >SegmentDeltaDocument</a>
                            </li>
                            <li class="link">
                                <a href="classes/SegmentDeltaResponseDto.html" data-type="entity-link" >SegmentDeltaResponseDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/SegmentDocument.html" data-type="entity-link" >SegmentDocument</a>
                            </li>
                            <li class="link">
                                <a href="classes/SegmentMemberDto.html" data-type="entity-link" >SegmentMemberDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/SegmentMembershipDocument.html" data-type="entity-link" >SegmentMembershipDocument</a>
                            </li>
                            <li class="link">
                                <a href="classes/SegmentMembersResponseDto.html" data-type="entity-link" >SegmentMembersResponseDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/SegmentResponseDto.html" data-type="entity-link" >SegmentResponseDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/SegmentRulesDto.html" data-type="entity-link" >SegmentRulesDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/TransactionDocument.html" data-type="entity-link" >TransactionDocument</a>
                            </li>
                            <li class="link">
                                <a href="classes/TransactionResponseDto.html" data-type="entity-link" >TransactionResponseDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/UpdateCustomerDto.html" data-type="entity-link" >UpdateCustomerDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/UpdateSegmentDto.html" data-type="entity-link" >UpdateSegmentDto</a>
                            </li>
                        </ul>
                    </li>
                        <li class="chapter">
                            <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#injectables-links"' :
                                'data-bs-target="#xs-injectables-links"' }>
                                <span class="icon ion-md-arrow-round-down"></span>
                                <span>Injectables</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                            <ul class="links collapse " ${ isNormalMode ? 'id="injectables-links"' : 'id="xs-injectables-links"' }>
                                <li class="link">
                                    <a href="injectables/CreateSegmentFacade.html" data-type="entity-link" >CreateSegmentFacade</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/CustomerActivityRepository.html" data-type="entity-link" >CustomerActivityRepository</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/CustomerRepository.html" data-type="entity-link" >CustomerRepository</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/CustomerRepository-1.html" data-type="entity-link" >CustomerRepository</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/CustomerService.html" data-type="entity-link" >CustomerService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/SegmentDeltaNotifierService.html" data-type="entity-link" >SegmentDeltaNotifierService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/SegmentDeltaRepository.html" data-type="entity-link" >SegmentDeltaRepository</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/SegmentMembershipFacade.html" data-type="entity-link" >SegmentMembershipFacade</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/SegmentMembershipRepository.html" data-type="entity-link" >SegmentMembershipRepository</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/SegmentMembershipSchedulerService.html" data-type="entity-link" >SegmentMembershipSchedulerService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/SegmentMembershipService.html" data-type="entity-link" >SegmentMembershipService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/SegmentPendingEventQueueService.html" data-type="entity-link" >SegmentPendingEventQueueService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/SegmentRepository.html" data-type="entity-link" >SegmentRepository</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/SegmentRuleEvaluatorService.html" data-type="entity-link" >SegmentRuleEvaluatorService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/SegmentSearchIndexerService.html" data-type="entity-link" >SegmentSearchIndexerService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/SegmentService.html" data-type="entity-link" >SegmentService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/TransactionRepository.html" data-type="entity-link" >TransactionRepository</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/TransactionService.html" data-type="entity-link" >TransactionService</a>
                                </li>
                            </ul>
                        </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#interfaces-links"' :
                            'data-bs-target="#xs-interfaces-links"' }>
                            <span class="icon ion-md-information-circle-outline"></span>
                            <span>Interfaces</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? ' id="interfaces-links"' : 'id="xs-interfaces-links"' }>
                            <li class="link">
                                <a href="interfaces/ActiveBuyersRuleInput.html" data-type="entity-link" >ActiveBuyersRuleInput</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ActiveMembershipRecord.html" data-type="entity-link" >ActiveMembershipRecord</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/AggregatedSegmentDelta.html" data-type="entity-link" >AggregatedSegmentDelta</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/BatchRecomputePayload.html" data-type="entity-link" >BatchRecomputePayload</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CustomerDto.html" data-type="entity-link" >CustomerDto</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PendingBatchEntry.html" data-type="entity-link" >PendingBatchEntry</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PendingTrigger.html" data-type="entity-link" >PendingTrigger</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/RiskRuleInput.html" data-type="entity-link" >RiskRuleInput</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SegmentDeltaPayload.html" data-type="entity-link" >SegmentDeltaPayload</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SegmentMembershipFacadeDeps.html" data-type="entity-link" >SegmentMembershipFacadeDeps</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SegmentMembershipTrigger.html" data-type="entity-link" >SegmentMembershipTrigger</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/TransactionCreatedEvent.html" data-type="entity-link" >TransactionCreatedEvent</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/VipBuyersRuleInput.html" data-type="entity-link" >VipBuyersRuleInput</a>
                            </li>
                        </ul>
                    </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#miscellaneous-links"'
                            : 'data-bs-target="#xs-miscellaneous-links"' }>
                            <span class="icon ion-ios-cube"></span>
                            <span>Miscellaneous</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="miscellaneous-links"' : 'id="xs-miscellaneous-links"' }>
                            <li class="link">
                                <a href="miscellaneous/enumerations.html" data-type="entity-link">Enums</a>
                            </li>
                            <li class="link">
                                <a href="miscellaneous/functions.html" data-type="entity-link">Functions</a>
                            </li>
                            <li class="link">
                                <a href="miscellaneous/typealiases.html" data-type="entity-link">Type aliases</a>
                            </li>
                            <li class="link">
                                <a href="miscellaneous/variables.html" data-type="entity-link">Variables</a>
                            </li>
                        </ul>
                    </li>
                        <li class="chapter">
                            <a data-type="chapter-link" href="routes.html"><span class="icon ion-ios-git-branch"></span>Routes</a>
                        </li>
                    <li class="chapter">
                        <a data-type="chapter-link" href="coverage.html"><span class="icon ion-ios-stats"></span>Documentation coverage</a>
                    </li>
                    <li class="divider"></li>
                    <li class="copyright">
                        Documentation generated using <a href="https://compodoc.app/" target="_blank" rel="noopener noreferrer">
                            <img data-src="images/compodoc-vectorise.png" class="img-responsive" data-type="compodoc-logo">
                        </a>
                    </li>
            </ul>
        </nav>
        `);
        this.innerHTML = tp.strings;
    }
});